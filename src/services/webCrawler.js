function normalizeUrl(url = '') {
  const trimmed = url.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function stripHtml(html = '') {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, noscript, svg, iframe').forEach((node) => node.remove());
  const title = doc.querySelector('title')?.textContent?.trim() || '';
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
  const headings = [...doc.querySelectorAll('h1,h2,h3')]
    .map((node) => node.textContent.trim())
    .filter(Boolean)
    .slice(0, 20);
  const text = doc.body?.textContent?.replace(/\s+/g, ' ').trim() || '';

  return {
    title,
    description,
    headings,
    text: text.slice(0, 18000),
    wordCount: text ? text.split(/\s+/).length : 0,
  };
}

function parseSitemap(xml = '') {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  return [...doc.querySelectorAll('url > loc, sitemap > loc')]
    .map((node) => node.textContent.trim())
    .filter(Boolean);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

function patternList(value = '') {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function matchesPattern(url, pattern) {
  if (!pattern) return true;
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(escaped).test(url);
}

function filterUrls(urls, source) {
  const includes = patternList(source.include_patterns);
  const excludes = patternList(source.exclude_patterns);
  return urls
    .filter((url) => includes.length === 0 || includes.some((pattern) => matchesPattern(url, pattern)))
    .filter((url) => excludes.length === 0 || !excludes.some((pattern) => matchesPattern(url, pattern)));
}

function limitForDepth(depth) {
  if (depth === 'site') return 12;
  if (depth === 'section') return 6;
  return 1;
}

export async function crawlWebSource(source) {
  const url = normalizeUrl(source.url);
  const startedAt = new Date().toISOString();
  if (!url) {
    return {
      status: 'failed',
      url,
      error: 'Missing URL',
      pages: [],
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }

  try {
    const firstText = await fetchText(url);
    const isSitemap = source.crawl_mode === 'sitemap' || url.endsWith('.xml') || firstText.includes('<urlset');
    const urls = isSitemap
      ? filterUrls(parseSitemap(firstText), source).slice(0, limitForDepth(source.crawl_depth))
      : [url];

    const pages = [];
    for (const pageUrl of urls) {
      try {
        const html = pageUrl === url ? firstText : await fetchText(pageUrl);
        pages.push({
          url: pageUrl,
          ...stripHtml(html),
          fetchedAt: new Date().toISOString(),
        });
      } catch (error) {
        pages.push({
          url: pageUrl,
          title: '',
          description: '',
          headings: [],
          text: '',
          wordCount: 0,
          error: error.message,
          fetchedAt: new Date().toISOString(),
        });
      }
    }

    const successfulPages = pages.filter((page) => page.text);
    return {
      status: successfulPages.length > 0 ? 'ready' : 'failed',
      url,
      crawlMode: source.crawl_mode,
      crawlDepth: source.crawl_depth,
      pages,
      text: successfulPages.map((page) => `# ${page.title || page.url}\n${page.description}\n${page.headings.join('\n')}\n${page.text}`).join('\n\n---\n\n'),
      error: successfulPages.length > 0 ? '' : 'No readable pages were fetched. The site may block browser crawling.',
      startedAt,
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'failed',
      url,
      error: `${error.message}. The site may block browser crawling or require server-side fetching.`,
      pages: [],
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }
}

export async function summarizeCrawl({ source, crawlResult, invokeLLM }) {
  if (crawlResult.status !== 'ready') {
    return `Web crawl failed for ${crawlResult.url}: ${crawlResult.error}`;
  }

  const prompt = `Summarize this crawled web source for a personal AI knowledge base.

Source URL: ${crawlResult.url}
Crawl mode: ${source.crawl_mode}
User notes: ${source.notes || 'none'}

Extract:
- important facts
- tone/style guidance
- FAQ-like knowledge
- caveats or stale-content warnings

Content:
${crawlResult.text.slice(0, 14000)}`;

  return invokeLLM({ prompt });
}

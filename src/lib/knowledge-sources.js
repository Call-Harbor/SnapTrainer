export function normalizeUrl(url = '') {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getValidWebSources(sources = []) {
  return sources
    .map((source) => ({ ...source, url: normalizeUrl(source.url) }))
    .filter((source) => source.url);
}

export function getValidFaqItems(items = []) {
  return items.filter((item) => item.question?.trim() && item.answer?.trim());
}

export function buildWebSourceSummary(source) {
  return [
    `Web source: ${source.url}`,
    `Crawl mode: ${source.crawl_mode || 'smart'}`,
    `Crawl depth: ${source.crawl_depth || 'page'}`,
    source.include_patterns && `Include patterns: ${source.include_patterns}`,
    source.exclude_patterns && `Exclude patterns: ${source.exclude_patterns}`,
    source.notes && `Learning notes: ${source.notes}`,
    'Use this source as a web-crawl instruction in the knowledge sweep. If the model cannot fetch live content, it must clearly state that only URL metadata is available.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildFaqSummary(item) {
  return [
    `FAQ question: ${item.question}`,
    `FAQ answer: ${item.answer}`,
    item.tags && `Tags: ${item.tags}`,
  ]
    .filter(Boolean)
    .join('\n');
}

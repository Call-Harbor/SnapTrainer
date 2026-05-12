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
    `Webkilde: ${source.url}`,
    `Crawl mode: ${source.crawl_mode || 'smart'}`,
    `Crawl depth: ${source.crawl_depth || 'page'}`,
    source.include_patterns && `Include patterns: ${source.include_patterns}`,
    source.exclude_patterns && `Exclude patterns: ${source.exclude_patterns}`,
    source.notes && `Læringsnoter: ${source.notes}`,
    'Brug denne kilde som en web-crawl instruktion i knowledge sweep. Hvis modellen ikke kan hente live-indhold, skal den tydeligt markere, at kun URL-metadata er tilgængelig.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildFaqSummary(item) {
  return [
    `FAQ-spørgsmål: ${item.question}`,
    `FAQ-svar: ${item.answer}`,
    item.tags && `Tags: ${item.tags}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Filters shared by the three backend search endpoints:
 *
 *   GET /catalogue/search   item_name, clothingcategory, style, brand, size, colour, material, min_price, max_price
 *   GET /wishlist/search    the same as catalogue
 *   GET /wardrobes/search   the same, without item_name, plus tags
 *
 * Every filter is optional. Style, brand, colour, material and tags take several values, sent by
 * repeating the key (?colour=blue&colour=black). Category, size and price take one value each.
 */

export type FilterKey = 'category' | 'size' | 'price' | 'colour' | 'style' | 'brand' | 'material' | 'tags';

/** The chosen option values per filter. Single-select filters hold at most one value. */
export type SearchFilters = Partial<Record<FilterKey, string[]>>;

export type FilterOption = { value: string; label: string };

export const MULTI_SELECT_FILTERS: readonly FilterKey[] = ['colour', 'style', 'brand', 'material', 'tags'];

export function isMultiSelect(key: FilterKey) {
  return MULTI_SELECT_FILTERS.includes(key);
}

export const FILTER_LABELS: Record<FilterKey, string> = {
  price: 'Price',
  category: 'Category',
  colour: 'Colour',
  style: 'Style',
  size: 'Size',
  brand: 'Brand',
  material: 'Material',
  tags: 'Tags',
};

// The backend only accepts these sizes and widens each to its equivalents (e.g. S -> 10, Small, XS/S).
export const SIZE_OPTIONS: FilterOption[] = ['3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => ({
  value: size,
  label: size,
}));

const PRICE_RANGES = [
  { value: 'under-50', label: 'Under $50', min: 0, max: 50 },
  { value: 'under-100', label: 'Under $100', min: 0, max: 100 },
  { value: 'under-200', label: 'Under $200', min: 0, max: 200 },
  { value: '200-plus', label: '$200+', min: 200, max: null },
];

export const PRICE_OPTIONS: FilterOption[] = PRICE_RANGES.map(({ value, label }) => ({ value, label }));

// The backend ignores min_price unless max_price is also set, so an open-ended range sends this ceiling.
const NO_MAX_PRICE = 1_000_000;

const PARAM_NAMES: Record<Exclude<FilterKey, 'price'>, string> = {
  category: 'clothingcategory',
  size: 'size',
  colour: 'colour',
  style: 'style',
  brand: 'brand',
  material: 'material',
  tags: 'tags',
};

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * Filter options from the values found on items, de-duplicated ignoring case and sorted.
 * Values are kept as stored, since tags are matched case-sensitively by the backend.
 */
export function collectOptions(values: (string | null | undefined)[], { keepCase = false } = {}): FilterOption[] {
  const seen = new Map<string, FilterOption>();
  for (const raw of values) {
    const value = raw?.trim();
    if (value && !seen.has(value.toLowerCase())) {
      seen.set(value.toLowerCase(), { value, label: keepCase ? value : titleCase(value) });
    }
  }
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
}

export function hasActiveFilters(filters: SearchFilters) {
  return Object.values(filters).some((values) => values && values.length > 0);
}

/**
 * The query string for a search, or null when there is nothing to search for.
 * `text` is sent as item_name, as a "contains" match (the backend runs it through ilike).
 */
export function buildSearchQuery(filters: SearchFilters, text = ''): string | null {
  const params = new URLSearchParams();

  const name = text.trim();
  if (name) params.append('item_name', `%${name}%`);

  for (const [key, values] of Object.entries(filters) as [FilterKey, string[] | undefined][]) {
    if (!values || values.length === 0) continue;

    if (key === 'price') {
      const range = PRICE_RANGES.find((option) => option.value === values[0]);
      if (!range) continue;
      if (range.min > 0) params.append('min_price', String(range.min));
      params.append('max_price', String(range.max ?? NO_MAX_PRICE));
      continue;
    }

    const chosen = isMultiSelect(key) ? values : values.slice(0, 1);
    for (const value of chosen) params.append(PARAM_NAMES[key], value);
  }

  const query = params.toString();
  return query ? query : null;
}

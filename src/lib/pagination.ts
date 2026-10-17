export const NEWS_PAGE_SIZE = 10;

export function newsPageCount(total: number): number {
  return Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE));
}

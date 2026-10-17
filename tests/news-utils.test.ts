import { describe, expect, it } from 'vitest';
import { NEWS_PAGE_SIZE, newsPageCount } from '../src/lib/pagination';

describe('news pagination', () => {
  it('keeps at least one page for empty or small collections', () => {
    expect(newsPageCount(0)).toBe(1);
    expect(newsPageCount(1)).toBe(1);
    expect(newsPageCount(5)).toBe(1);
    expect(newsPageCount(10)).toBe(1);
  });

  it('adds pages every 10 items', () => {
    expect(newsPageCount(11)).toBe(2);
    expect(newsPageCount(20)).toBe(2);
    expect(newsPageCount(21)).toBe(3);
    expect(newsPageCount(121)).toBe(13);
  });

  it('uses a page size of 10', () => {
    expect(NEWS_PAGE_SIZE).toBe(10);
  });
});

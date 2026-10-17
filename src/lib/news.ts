import { getCollection, type CollectionEntry } from 'astro:content';

export { NEWS_PAGE_SIZE, newsPageCount } from './pagination';

export type NewsEntry = CollectionEntry<'news'>;

export async function getPublishedNews(): Promise<NewsEntry[]> {
  const news = await getCollection('news', ({ data }) => !data.draft);
  return news.sort((a, b) => {
    const dateDelta = b.data.date.valueOf() - a.data.date.valueOf();
    if (dateDelta !== 0) return dateDelta;
    return b.id.localeCompare(a.id);
  });
}

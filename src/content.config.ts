import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { newsSchema } from './lib/news-schema';

export const collections = {
  news: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
    schema: newsSchema,
  }),
};

import { z } from 'zod';

export const newsSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  date: z.coerce.date(),
  summary: z.string().min(1, '摘要不能为空').max(300, '摘要建议不超过 300 字'),
  source: z.string().optional(),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  draft: z.boolean().default(false),
  legacyPath: z.string().optional(),
});

export type NewsFrontmatter = z.infer<typeof newsSchema>;

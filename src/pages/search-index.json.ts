import { products } from '@/data/products';
import { solutions } from '@/data/solutions';
import { company } from '@/data/about';
import { getPublishedNews } from '@/lib/news';

export const prerender = true;

type SearchItem = {
  title: string;
  description: string;
  url: string;
  type: 'product' | 'solution' | 'page' | 'news';
  body?: string;
  date?: string;
};

function stripMarkdown(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET() {
  const news = await getPublishedNews();

  const pages: SearchItem[] = [
    {
      title: '首页',
      description: '联易软件 ZSAC 接入安全生态，设备、用户、应用、授权统一管理。',
      url: '/',
      type: 'page',
      body: company.intro,
    },
    ...products.map<SearchItem>((product) => ({
      title: product.name,
      description: product.tagline,
      url: `/products/${product.slug}/`,
      type: 'product',
      body: [...product.intro, ...(product.features ?? []).map((feature) => feature.description)].join(' '),
    })),
    ...solutions.map<SearchItem>((solution) => ({
      title: solution.name,
      description: solution.tagline,
      url: `/solutions/${solution.slug}/`,
      type: 'solution',
      body: [...solution.market, ...solution.solution].join(' '),
    })),
    {
      title: '公司简介',
      description: '联易软件有限公司聚焦国产动态软件密码接入安全体系建设。',
      url: '/about/',
      type: 'page',
      body: company.intro,
    },
    {
      title: '企业文化',
      description: '联易软件的使命、价值观与企业文化。',
      url: '/about/culture/',
      type: 'page',
      body: `${company.mission} ${company.missionText} ${company.values} ${company.valuesText}`,
    },
    {
      title: '荣誉资质',
      description: '高新技术企业证书、商用密码产品认证证书与发明专利。',
      url: '/about/honors/',
      type: 'page',
    },
    {
      title: '行业案例',
      description: '政务、金融、能源、交通、工业、物联网等行业的接入安全实践。',
      url: '/about/cases/',
      type: 'page',
    },
    {
      title: '联系我们',
      description: '联易软件联系电话、邮箱与办公地址。',
      url: '/contact/',
      type: 'page',
    },
    {
      title: '新闻动态',
      description: '联易软件新闻动态，关注密码技术、数据安全与接入安全。',
      url: '/news/',
      type: 'page',
    },
  ];

  const newsItems: SearchItem[] = news.map((entry) => ({
    title: entry.data.title,
    description: entry.data.summary,
    url: `/news/${entry.id}/`,
    type: 'news',
    body: stripMarkdown(entry.body ?? '').slice(0, 600),
    date: entry.data.date.toISOString().slice(0, 10),
  }));

  return new Response(JSON.stringify([...pages, ...newsItems]), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

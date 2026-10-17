export type HeroSlide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: 'ZSAC 接入安全生态',
    title: '始于细节，专注于设备、人员、数据的密码安全服务',
    subtitle:
      '以自主创新的 ZSAC 接入安全机制，为多形态终端、数据共享与用户认证提供合规、易用、有效的安全底座。',
    image: '/images/home/hero-3.webp',
    imageAlt: 'ZSAC 接入安全生态中的设备、用户与应用连接',
    primary: { label: '探索产品', href: '/#products' },
    secondary: { label: '了解方案', href: '/#solutions' },
  },
  {
    eyebrow: '产品及服务',
    title: '创新不止眼前',
    subtitle: '为您重构合规、易用、有效的接入安全新体系，让每一次接入都有可信的身份与边界。',
    image: '/images/home/hero-2.webp',
    imageAlt: '联易软件接入安全产品及服务连接示意',
    primary: { label: '查看产品', href: '/#products' },
    secondary: { label: '联系我们', href: '/contact/' },
  },
  {
    eyebrow: '关于联易',
    title: '联于政通，易于人和',
    subtitle:
      '聚焦国产动态软件密码接入安全体系建设，以创新密码技术、产品与服务，解决“端”到“云”的接入安全核心痛点。',
    image: '/images/products/zsac-crypto-module/banner.webp',
    imageAlt: 'ZSAC 密码模块与接入安全能力',
    primary: { label: '了解联易', href: '/about/' },
    secondary: { label: '新闻动态', href: '/news/' },
  },
];

export type HomeIcon = 'clock' | 'shield' | 'settings' | 'layers' | 'device' | 'users' | 'apps' | 'key' | 'spark' | 'check' | 'chart';

export const services: { title: string; subtitle: string; icon: HomeIcon }[] = [
  {
    title: '7X12 小时服务',
    subtitle: '专家一对一',
    icon: 'clock',
  },
  {
    title: '持续业务保障',
    subtitle: '响应零延迟',
    icon: 'shield',
  },
  {
    title: '标准化实施',
    subtitle: '全智能实时监控',
    icon: 'settings',
  },
  {
    title: '强大的交付能力',
    subtitle: '实现客户价值',
    icon: 'layers',
  },
];

export const ecosystem: { title: string; description: string; icon: HomeIcon }[] = [
  {
    title: '设备管理',
    description: '多形态终端设备指纹绑定与状态管理。',
    icon: 'device',
  },
  {
    title: '用户管理',
    description: '全量用户、权限与组织统一管理。',
    icon: 'users',
  },
  {
    title: '应用管理',
    description: '业务应用接入、授权与访问控制。',
    icon: 'apps',
  },
  {
    title: '授权中心',
    description: '基于密码模块的可信身份与授权。',
    icon: 'key',
  },
];

export const valueCards: { title: string; description: string; icon: HomeIcon }[] = [
  {
    title: '安全',
    description: '基于密码算法的双向认证，保障合法终端与应用接入。',
    icon: 'shield',
  },
  {
    title: '易用',
    description: '多形态终端普遍适配，软密码模块集成部署简单。',
    icon: 'spark',
  },
  {
    title: '合规',
    description: '以国密专用算法为核心，面向商用密码安全合规要求设计。',
    icon: 'check',
  },
  {
    title: '经济',
    description: '软密码模块形态，降低终端改造与规模部署成本。',
    icon: 'chart',
  },
];

export const industries = [
  '金融',
  '能源',
  '工业',
  '电力',
  '交通',
  '大型国央企',
  '政务',
  '应急',
  '环保',
  '公安',
];

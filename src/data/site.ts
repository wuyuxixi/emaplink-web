export const site = {
  name: '联易软件',
  legalName: '联易软件有限公司',
  url: 'https://www.emaplink.com.cn',
  phone: '029-87607528',
  phoneHref: 'tel:02987607528',
  email: 'maplink@emaplink.com.cn',
  emailHref: 'mailto:maplink@emaplink.com.cn',
  address: '陕西省西安市高新区西安软件园汉韵阁C101座',
  icp: '陕ICP备18022983号-1',
  icpUrl: 'https://www.miit.gov.cn/',
  copyright: '© 2021–2026 联易软件有限公司',
  description:
    '联易软件聚焦国产动态软件密码接入安全体系建设，以 ZSAC 接入安全机制为设备、人员、数据提供合规、易用、有效的密码安全服务。',
} as const;

export type NavChild = {
  label: string;
  href: string;
  description?: string;
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

export const productNav: NavChild[] = [
  {
    label: 'ZSAC智能准入控制系统',
    href: '/products/zsac-gateway/',
    description: '多形态终端可信准入',
  },
  {
    label: 'ZSAC接入安全服务端',
    href: '/products/zsac-server/',
    description: '业务系统零改造准入',
  },
  {
    label: 'ZSAC接入安全密码模块',
    href: '/products/zsac-crypto-module/',
    description: '自主开放的安全机制',
  },
  {
    label: 'ZSAC动态令（密码模块）',
    href: '/products/zsac-otp/',
    description: '国密多因素认证',
  },
];

export const solutionNav: NavChild[] = [
  {
    label: '多形态终端接入安全',
    href: '/solutions/multi-terminal-access/',
    description: '终端身份与行为管控',
  },
  {
    label: '数据共享交互安全',
    href: '/solutions/data-exchange/',
    description: '跨域数据交互保护',
  },
  {
    label: '用户认证与应用保护',
    href: '/solutions/app-protection/',
    description: '统一门户与集中授权',
  },
];

export const mainNav: NavItem[] = [
  { label: '首页', href: '/' },
  { label: '产品中心', href: '/#products', children: productNav },
  { label: '解决方案', href: '/#solutions', children: solutionNav },
  { label: '行业案例', href: '/about/cases/' },
  { label: '新闻动态', href: '/news/' },
  {
    label: '关于我们',
    href: '/about/',
    children: [
      { label: '公司简介', href: '/about/', description: '联于政通，易于人和' },
      { label: '企业文化', href: '/about/culture/', description: '联合创新、相互成就' },
      { label: '荣誉资质', href: '/about/honors/', description: '资质与产品认证' },
    ],
  },
  { label: '联系我们', href: '/contact/' },
];

export const footerNav = {
  products: productNav,
  solutions: solutionNav,
  about: [
    { label: '公司简介', href: '/about/' },
    { label: '企业文化', href: '/about/culture/' },
    { label: '荣誉资质', href: '/about/honors/' },
    { label: '行业案例', href: '/about/cases/' },
    { label: '新闻动态', href: '/news/' },
    { label: '联系我们', href: '/contact/' },
  ],
};

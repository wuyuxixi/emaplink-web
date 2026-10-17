export const company = {
  intro:
    '联易软件有限公司聚焦国产动态软件密码接入安全体系建设。致力于以创新密码技术、产品、服务，真正解决“端”到“云”的接入安全核心痛点，实现国密“接”万物，物联“真”安全。公司以差异化的核心技术赋能生态战略伙伴，围绕真正解决用户“接入安全”为目标，依托国密接入安全体系解决传统密码技术长久解决不了、解决不好的安全顽疾。密码技术与产品广泛服务于公安、金融、交通、工业、政务、物联网、云服务等行业。',
  mission: '联合创新、相互成就',
  missionText:
    '以创新密码技术、产品与服务，解决“端”到“云”的接入安全核心痛点，与客户、伙伴联合创新、相互成就。',
  values: '高效合作、持续共赢',
  valuesText:
    '以差异化的核心技术赋能生态战略伙伴，围绕真正解决用户“接入安全”为目标，持续创造价值。',
  brandLine: '联于政通，易于人和',
  brandSubline: 'PIONEER OF DIGITAL SERVICE',
};

export type Honor = {
  group: '企业资质' | '产品认证' | '发明专利';
  title: string;
  description: string;
  image: string;
  alt: string;
};

export const honors: Honor[] = [
  {
    group: '企业资质',
    title: '高新技术企业证书',
    description: '证书编号 GR202561000943，发证时间 2025 年 12 月 19 日，有效期三年。',
    image: '/images/about/credentials/high-tech-2025.webp',
    alt: '高新技术企业证书，联易软件有限公司，2025 年',
  },
  {
    group: '企业资质',
    title: '陕西省技术贸易许可证',
    description: '陕技贸 高新 字第 0843 号，2018 年 7 月 25 日。',
    image: '/images/about/credentials/cert-1.webp',
    alt: '陕西省技术贸易许可证，联易软件有限公司',
  },
  {
    group: '产品认证',
    title: 'ZSAC 智能准入控制系统（密码模块）',
    description: '商用密码产品认证证书，证书编号 GM016112220240542，ZSAC V1.2。',
    image: '/images/about/credentials/zsac.webp',
    alt: 'ZSAC 智能准入控制系统（密码模块）商用密码产品认证证书',
  },
  {
    group: '产品认证',
    title: 'ZSAC 接入安全服务端（密码模块）',
    description: '商用密码产品认证证书，证书编号 GM016112220250343，ZSAC-ONE V2.0。',
    image: '/images/about/credentials/zsac-one.webp',
    alt: 'ZSAC 接入安全服务端（密码模块）商用密码产品认证证书',
  },
  {
    group: '产品认证',
    title: 'ZSAC 接入安全密码模块',
    description: '商用密码产品认证证书，证书编号 GM016112220250671，ZSAC-MM V2.0。',
    image: '/images/about/credentials/zsac-mm.webp',
    alt: 'ZSAC 接入安全密码模块商用密码产品认证证书',
  },
  {
    group: '产品认证',
    title: 'ZSAC 动态令（密码模块）',
    description: '商用密码产品认证证书，证书编号 GM016112220250670，ZSAC-OTP V2.0。',
    image: '/images/about/credentials/zsac-otp.webp',
    alt: 'ZSAC 动态令（密码模块）商用密码产品认证证书',
  },
  {
    group: '发明专利',
    title: '药品监管平台与异构售药系统的数据采集系统及方法',
    description: '发明专利，专利号 ZL 2016 1 0140146.5，授权公告号 CN 105827693 B。',
    image: '/images/about/credentials/cert-2.webp',
    alt: '发明专利证书：药品监管平台与异构售药系统的数据采集系统及方法',
  },
  {
    group: '发明专利',
    title: '多业务系统权限统一管理方法、装置及系统',
    description: '发明专利，专利号 ZL 2019 1 1170336.1，授权公告号 CN 112948777 B。',
    image: '/images/about/credentials/patent-1.webp',
    alt: '发明专利证书：多业务系统权限统一管理方法、装置及系统',
  },
  {
    group: '发明专利',
    title: '数据处理方法、装置、设备及存储介质',
    description: '发明专利，专利号 ZL 2019 1 0853237.7，授权公告号 CN 112565155 B。',
    image: '/images/about/credentials/patent-2.webp',
    alt: '发明专利证书：数据处理方法、装置、设备及存储介质',
  },
  {
    group: '发明专利',
    title: '数据处理方法及相关装置',
    description: '发明专利，专利号 ZL 2019 1 0853982.1，授权公告号 CN 112559561 B。',
    image: '/images/about/credentials/patent-3.webp',
    alt: '发明专利证书：数据处理方法及相关装置',
  },
];

export type CaseStudy = {
  title: string;
  summary: string;
  sector: string;
  source: string;
};

export const cases: CaseStudy[] = [
  {
    title: '陕西省药品安全监管“陕药通”',
    summary:
      '依托陕西省药品安全监管综合业务系统，“陕药通”小程序实现信息登记、信息共享与监管码采集，并对信息查阅权限进行严格划分，减负企业、方便群众。',
    sector: '政务 · 药品监管',
    source: '据 2021 年 2 月公开报道整理',
  },
  {
    title: '陕西“陕非冷链”进口非冷链物品追溯',
    summary:
      '继进口冷链食品追溯系统之后，陕西建立进口非冷链物品追溯系统，实现进口非冷链物品的追溯管理，并对生产经营单位实行实名销售与电子追溯码管理。',
    sector: '政务 · 食品安全',
    source: '据 2021 年 2 月公开报道整理',
  },
  {
    title: '内蒙古“蒙冷链”冷链食品追溯',
    summary:
      '“蒙冷链”追溯平台覆盖进口冷链食品生产加工、销售、贮存、餐饮等环节，形成从供应链首站到消费环节的闭环追溯，做到“首站赋码、一码到底、来源可追、去向可查”。',
    sector: '政务 · 冷链追溯',
    source: '据 2021 年 2 月公开报道整理',
  },
];

export const contact = {
  mapImage: '/images/about/contact-map.webp',
  mapAlt: '联易软件办公地址位置示意',
  mapUrl: 'https://map.baidu.com/search/西安软件园汉韵阁',
};

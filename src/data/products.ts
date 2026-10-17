export type ProductFeature = {
  title: string;
  description: string;
};

export type Product = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  intro: string[];
  features?: ProductFeature[];
  capabilities?: string[];
  advantages?: ProductFeature[];
  mechanisms?: { title: string; points: string[] }[];
  ecosystem?: string;
  scenarios?: string;
  scenarioTags?: string[];
  heroImage: string;
  heroAlt: string;
  diagramImage?: string;
  diagramAlt?: string;
  gallery?: { src: string; alt: string }[];
  legacyPath: string;
  metaDescription: string;
};

export const industryTags = [
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

export const products: Product[] = [
  {
    slug: 'zsac-gateway',
    name: 'ZSAC智能准入控制系统',
    shortName: 'ZSAC 智能准入控制系统',
    tagline: '以软密码模块实现多形态终端的可信准入',
    intro: [
      '以先进、创新的 ZSAC 接入安全机制为核心，通过低功耗、低延时、高安全的国密专用算法实现可信身份标识软密码模块。软密码模块在保证安全合规的基础上，具有多形态物联网终端普遍适配、集成部署简单、成本优势明显等特点。',
      'ZSAC 接入安全网关通过可信身份标识软密码模块与物联网终端进行设备指纹绑定，为每一个终端生成个性化安全算法。基于密码算法的双向认证，实现合法终端入网，非法终端阻断。',
    ],
    features: [
      {
        title: '可信身份标识',
        description: '多形态物联网终端设备指纹绑定，个性化安全插件下发。',
      },
      {
        title: '准入控制',
        description: '支持终端管理、准入策略、阻断策略、白名单、交换机联动等功能。',
      },
      {
        title: '状态管理',
        description:
          '支持对入网设备进行状态管理，包括准入终端、离线终端、私接终端、仿冒终端、风险终端、阻断终端等。',
      },
      {
        title: '风险评估',
        description: '支持漏洞扫描、弱口令扫描等。',
      },
      {
        title: '网络功能',
        description: '支持静态路由、DNS 配置、NAT 地址转换、ALG 应用层网关等。',
      },
      {
        title: '统计分析',
        description:
          '支持终端数量统计、网络流量统计、物理接口流量统计、设备信息统计、应用统计等。',
      },
      {
        title: '日志告警',
        description: '支持告警配置、日志查询、日志汇总分析、数据管理等。',
      },
    ],
    scenarios:
      'ZSAC 接入安全网关以软密码模块的双向认证实现终端准入控制，能够适配各类物联网终端，可以应用在金融、能源、工业、电力、交通、大型国央企、政务、应急、环保、公安等行业实现物联网终端安全接入场景。',
    scenarioTags: industryTags,
    heroImage: '/images/products/zsac-gateway/banner.webp',
    heroAlt: 'ZSAC 智能准入控制系统',
    diagramImage: '/images/products/zsac-gateway/diagram.webp',
    diagramAlt: 'ZSAC 智能准入控制系统通过软密码模块实现终端身份绑定与双向认证',
    gallery: [
      {
        src: '/images/products/zsac-gateway/gallery-1.webp',
        alt: 'ZSAC 智能准入控制系统终端接入示意',
      },
      {
        src: '/images/products/zsac-gateway/gallery-2.webp',
        alt: 'ZSAC 智能准入控制系统部署结构',
      },
    ],
    legacyPath: 'products-insert.html',
    metaDescription:
      'ZSAC 智能准入控制系统以国密软密码模块实现多形态物联网终端的设备指纹绑定、双向认证与准入控制，适配金融、能源、政务等行业。',
  },
  {
    slug: 'zsac-server',
    name: 'ZSAC接入安全服务端',
    shortName: 'ZSAC 接入安全服务端',
    tagline: '应用容器与安全插件融合，业务系统零改造准入',
    intro: [
      '以先进、创新的 ZSAC 接入安全机制为核心，实现 H5 安全插件、移动端安全插件，并构建应用容器与安全插件融合。应用容器可动态配置多个业务应用，应用系统无需改造，即可实现对访问应用的请求进行准入控制和权限鉴别，保护后台应用安全。',
      '一体化安全系统包含统一门户、应用认证网关、用户管理、权限管理、认证中心等子系统，能够完全满足业务应用的安全准入需求。并可提供轻量化 SSO 单点登录服务。',
    ],
    features: [
      {
        title: '可信身份标识',
        description: '支持 H5 浏览器指纹绑定、移动端硬件指纹绑定，个性化安全插件下发。',
      },
      {
        title: '应用准入控制',
        description: '支持应用管理、准入策略、阻断策略、白名单等功能。',
      },
      {
        title: '用户管理',
        description: '支持全量用户管理，用户数据同步。用户批量导入导出等。',
      },
      {
        title: '权限管理',
        description: '支持 RBAC 的权限管理，并在请求访问通过应用网关实时进行权限鉴别。',
      },
      {
        title: '统一门户',
        description: '支持 H5 统一门户、移动端统一门户，轻松集成各类业务应用。',
      },
      {
        title: '认证中心',
        description: '对应用访问请求进行可信身份认证。',
      },
      {
        title: 'SSO 单点登录',
        description: '支持基于密码模块身份认证信息共享的单点登录服务。',
      },
    ],
    scenarios:
      '一体化安全系统以国密算法实现安全准入、业务系统零改造，适用于在金融、能源、工业、电力、交通、大型国央企、政务、应急、环保、公安等跨部门、跨层级的集中管理、集中授权、集中准入控制。',
    scenarioTags: industryTags,
    heroImage: '/images/products/zsac-server/banner.webp',
    heroAlt: 'ZSAC 接入安全服务端',
    diagramImage: '/images/products/zsac-server/diagram.webp',
    diagramAlt: 'ZSAC 接入安全服务端统一门户、认证网关与权限管理结构',
    gallery: [
      {
        src: '/images/products/zsac-server/gallery-1.webp',
        alt: 'ZSAC 接入安全服务端应用容器与安全插件融合',
      },
      {
        src: '/images/products/zsac-server/gallery-2.webp',
        alt: 'ZSAC 接入安全服务端部署结构',
      },
    ],
    legacyPath: 'products-app.html',
    metaDescription:
      'ZSAC 接入安全服务端通过应用容器与安全插件融合，实现统一门户、应用认证网关、用户与权限管理，业务系统无需改造即可完成安全准入。',
  },
  {
    slug: 'zsac-crypto-module',
    name: 'ZSAC接入安全密码模块',
    shortName: 'ZSAC 接入安全密码模块',
    tagline: '自主开放的密码技术安全机制',
    intro: [
      'ZSAC 是自主开放的、基于密码技术的、全球领先的安全机制。',
      'ZSAC 从信任机制、密码机制、传输机制与进化机制四个维度，构建可持续演进的接入安全底座，为设备、用户、应用与授权中心提供统一的密码信任基础。',
    ],
    ecosystem:
      'ZSAC 接入安全生态以密码模块为核心，连接设备、用户、应用与授权中心，形成技术可控、职责可管、服务可塑的接入安全体系。',
    mechanisms: [
      {
        title: '信任机制',
        points: [
          'ZSAC 以人、设备和服务为核心，通过动态持续的认证检测，实时感知服务存在的风险。',
          'ZSAC 信任机制将信任转化为密码标识，一旦感知到风险，立即识别并标识，采取层进式的防御手段，不断提升御防强度。',
          'ZSAC 的信任绑定到服务，有助于实现跨越设备和不同边界的微服务复制、负载均衡和调度。',
        ],
      },
      {
        title: '密码机制',
        points: [
          '一人一密、一机一密、一次一密的密码机制。',
          '轻量化（Lightweight）、低延迟、高性能的密码技术，是支持动态实时认证策略的基础。',
          '基于国密批准算法，以及公开算法。',
        ],
      },
      {
        title: '传输机制（ALTS）',
        points: [
          '基于 ZSAC 定义应用层传输安全 ALTS。',
          '用于应用层和远程过程调用（RPC）的点到点、服务到服务的传输安全。',
          'ALTS 是基于双向认证、会话密钥协商、完整性和传输加密的完整机制。',
          'ALTS 不受物理传输的限制，可随服务动态调度。',
        ],
      },
      {
        title: '进化机制',
        points: [
          '不断发展提升的安全机制和决策机制。',
          '决策机制包含人、设备和服务等多种维度，全方位定义风险和决策机制。',
          '决策机制是开放扩展的，不断提升决策水平。',
        ],
      },
    ],
    advantages: [
      {
        title: '安全',
        description: '基于密码算法的双向认证，保障合法终端与应用接入。',
      },
      {
        title: '易用',
        description: '多形态终端普遍适配，软密码模块集成部署简单。',
      },
      {
        title: '合规',
        description: '以国密专用算法为核心，面向商用密码安全合规要求设计。',
      },
      {
        title: '经济',
        description: '软密码模块形态，降低终端改造与规模部署成本。',
      },
    ],
    heroImage: '/images/products/zsac-crypto-module/banner.webp',
    heroAlt: 'ZSAC 接入安全密码模块',
    diagramImage: '/images/products/zsac-crypto-module/diagram.webp',
    diagramAlt: 'ZSAC 接入安全生态结构',
    gallery: [
      {
        src: '/images/products/zsac-crypto-module/gallery-1.webp',
        alt: 'ZSAC 核心要素',
      },
      {
        src: '/images/products/zsac-crypto-module/gallery-2.webp',
        alt: 'ZSAC 接入安全生态',
      },
      {
        src: '/images/products/zsac-crypto-module/gallery-3.webp',
        alt: 'ZSAC 接入安全生态优势',
      },
      {
        src: '/images/products/zsac-crypto-module/gallery-4.webp',
        alt: 'ZSAC 密码模块能力',
      },
    ],
    legacyPath: 'products-model.html',
    metaDescription:
      'ZSAC 接入安全密码模块是自主开放的、基于密码技术的安全机制，以安全、易用、合规、经济的软密码模块构建接入安全生态。',
  },
  {
    slug: 'zsac-otp',
    name: 'ZSAC动态令（密码模块）',
    shortName: 'ZSAC 动态令',
    tagline: '基于国密算法与动态密码技术的多因素认证',
    intro: [
      '基于国密算法和动态密码技术，为 WEB 系统提供多因素认证解决方案。采用新一代国产动态软件密码机制，通过时间、设备信息、挑战码等多重因子，生成一次性动态口令，有效解决弱口令和账号失窃等安全问题，为应用系统提供高安全性的身份鉴别和交易认证服务。',
      '该方案已通过国家密码管理局授权的检测机构检测认证，并荣获《商用密码产品认证证书》，满足等保 2.0（三级要求）及密评等安全合规标准。',
    ],
    capabilities: [
      '基于挑战型或者时间型生成一次性动态口令。',
      '满足各种场景下的身份鉴别需求。',
    ],
    advantages: [
      {
        title: '高安全性',
        description:
          '将口令与密码指纹、硬件指纹等结合使用，且动态口令是一次性的，攻击者无法重复使用截获的密码。',
      },
      {
        title: '动态性',
        description:
          '动态令产生的口令按时间变化，不同时刻使用不同口令登录，每个口令都只在其产生的时间范围内有效。',
      },
      {
        title: '随机性',
        description: '动态口令每次都是随机产生的，不可预测。',
      },
      {
        title: '便携性',
        description:
          '动态令客户端以软件形式安装在移动设备上，动态口令显示在移动设备上，满足随时、随地使用。',
      },
    ],
    heroImage: '/images/products/zsac-otp/banner.webp',
    heroAlt: 'ZSAC 动态令（密码模块）',
    gallery: [],
    legacyPath: 'products-dynamic.html',
    metaDescription:
      'ZSAC 动态令基于国密算法与动态密码技术，为 WEB 系统提供多因素认证，具备高安全性、动态性、随机性与便携性。',
  },
];

export const productBySlug = new Map(products.map((product) => [product.slug, product]));

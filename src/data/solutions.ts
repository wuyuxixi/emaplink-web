import { industryTags } from './products';

export type SolutionValue = {
  title: string;
  description: string;
};

export type Solution = {
  slug: string;
  name: string;
  tagline: string;
  market: string[];
  solution: string[];
  pillars?: SolutionValue[];
  scenarios: string;
  scenarioTags: string[];
  values: SolutionValue[];
  heroImage: string;
  heroAlt: string;
  legacyPath: string;
  metaDescription: string;
};

export const solutions: Solution[] = [
  {
    slug: 'multi-terminal-access',
    name: '多形态终端接入安全',
    tagline: '让每一类终端都能安全接入',
    market: [
      '随着移动产业、物联网产业的高速发展，移动终端、物联网感知终端在各个行业进行了大规模的部署和应用。与此同时，物联网终端的安全问题也越来越突出，如何对终端的身份和行为进行认证和管控，实现设备的安全接入和安全应用，成为行业的共识。',
      '联易软件推出的“多形态终端安全接入”方案，基于先进的 ZSAC 接入安全机制，以创新的密码算法实现软密码身份模块，具有终端普遍适配、安全合规、性能可靠、成本低廉等明显优势，可满足不同终端设备的安全接入需求。',
    ],
    solution: [
      '方案以软密码模块的双向认证实现终端准入控制，能够适配各类物联网终端，覆盖终端身份、行为与流量的持续校验。',
    ],
    pillars: [
      { title: '持续认证', description: '对终端身份与行为进行持续校验。' },
      { title: '实时阻断', description: '发现异常终端与异常行为即时阻断。' },
      { title: '全流量接入', description: '覆盖终端全流量接入与管控。' },
    ],
    scenarios:
      '多形态终端安全接入解决方案，以软密码模块的双向认证实现终端准入控制，能够适配各类物联网终端，可以应用在金融、能源、工业、电力、交通、大型国央企、政务、应急、环保、公安等实现物联网终端安全接入场景。',
    scenarioTags: industryTags,
    values: [
      {
        title: '轻松适配',
        description:
          '待接入终端设备集成适配软密码模块 SDK，SDK 大小 20K，运行空间 500K，可轻松运行于各类终端设备中。',
      },
      {
        title: '安全管控',
        description:
          '软密码模块 SDK 与配套的安全网关，基于双向认证实现设备的身份识别及准入管控。',
      },
      {
        title: '无缝融合',
        description: '可与客户已有的用户管理、设备管理系统进行对接集成。',
      },
    ],
    heroImage: '/images/solutions/multi-terminal-access/banner.webp',
    heroAlt: '多形态终端接入安全',
    legacyPath: 'programme-insert.html',
    metaDescription:
      '多形态终端接入安全方案基于 ZSAC 接入安全机制与软密码模块，为移动终端、物联网终端提供持续认证、实时阻断与全流量接入管控。',
  },
  {
    slug: 'data-exchange',
    name: '数据共享交互安全',
    tagline: '跨机构、跨层级的数据交互可信可控',
    market: [
      '大数据技术在各个领域的广泛应用，使得数据安全问题越来越被重视，特别是在跨机构、跨层级的数据共享交互应用中，数据的安全问题尤为突出。数据共享交换必须要保证数据在交互过程中防泄漏、防篡改、不可抵赖。',
      'ZSAC 数据共享交互安全解决方案，通过密码算法对数据交互双方进行身份标识和认证管控，并在传输过程中对数据进行高效加密和签名。产品可与应用系统、应用服务器进行无缝集成，保证数据交互安全。',
    ],
    solution: [
      '方案以密码算法对数据交互双方进行身份标识和认证管控，在传输过程中对数据进行加密和签名，保证数据交互过程中的防泄漏、防篡改、不可抵赖。',
    ],
    scenarios:
      '主要应用在金融、能源、工业、电力、交通、大型国央企、政务、应急、环保、公安等需要与多层级、多部门、多业务系统进行数据共享交互的场景。',
    scenarioTags: industryTags,
    values: [
      {
        title: '轻量集成',
        description:
          '数据交互服务器、服务总线、应用系统等适配软密码模块 SDK，SDK 大小 20K，运行空间 500K，可轻松集成到各类服务器与信息化系统中。',
      },
      {
        title: '传输保护',
        description:
          '软密码模块 SDK 与配套的安全网关，基于双向认证实现设备的身份识别及交互管控，并对数据进行传输加密保护。',
      },
      {
        title: '无缝融合',
        description: '可与客户已有的用户管理、权限管理、设备管理系统进行对接集成。',
      },
    ],
    heroImage: '/images/solutions/data-exchange/banner.webp',
    heroAlt: '数据共享交互安全',
    legacyPath: 'programme-interactive.html',
    metaDescription:
      '数据共享交互安全方案通过密码算法实现交互双方身份标识、认证管控与传输加密签名，适用于跨机构、跨层级、多业务系统的数据共享场景。',
  },
  {
    slug: 'app-protection',
    name: '用户认证与应用保护',
    tagline: '统一门户、统一认证、集中授权，业务系统零改造',
    market: [
      '在各个领域信息化系统建设规模越来越大，如何对庞大复杂的众多业务系统进行有效管理成为一个新的问题，因此产生了统一门户、统一认证、集中授权等解决方案和产品。',
      '联易软件的用户认证与应用保护解决方案，将密码技术与信息技术进行融合，通过软密码身份模块与应用容器结合，认证网关从网络传输层进行认证与管控，实现业务系统零改造，即可实现统一的用户管理、认证管理、权限管理等。',
    ],
    solution: [
      '方案以软密码身份模块与应用容器结合，认证网关从网络传输层进行认证与管控，在不改造业务系统的前提下实现统一用户管理、认证管理与权限管理。',
    ],
    scenarios:
      '主要应用在金融、能源、工业、电力、交通、大型国央企、政务、应急、环保、公安等具有众多业务应用系统，需要进行统一高效管理的场景。',
    scenarioTags: industryTags,
    values: [
      {
        title: '快速部署',
        description:
          '统一门户系统已完成容器级软密码模块适配，支持移动端、H5 浏览器端，部署后与应用认证网关协作即可实现统一用户认证和鉴权管理。',
      },
      {
        title: '无需改造',
        description: '应用系统无需改造，只需在统一门户系统进行注册和授权管理。',
      },
      {
        title: '无缝融合',
        description: '可与客户已有的用户管理、权限管理系统进行对接集成。',
      },
    ],
    heroImage: '/images/solutions/app-protection/banner.webp',
    heroAlt: '用户认证与应用保护',
    legacyPath: 'programme-app.html',
    metaDescription:
      '用户认证与应用保护方案通过软密码身份模块、应用容器与认证网关，实现统一门户、统一认证、集中授权，业务系统无需改造。',
  },
];

export const solutionBySlug = new Map(solutions.map((solution) => [solution.slug, solution]));

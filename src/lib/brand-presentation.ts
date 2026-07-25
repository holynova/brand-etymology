import type { Brand } from "../types";

type CardBrand = Pick<Brand, "id" | "name" | "zhName" | "reading" | "country" | "category">;

const popularIds = [
  "apple", "google", "microsoft", "amazon", "coca-cola", "samsung", "toyota", "nike", "tesla", "mcdonald-s",
  "tencent", "alibaba", "huawei", "xiaomi", "byd", "sony", "nintendo", "netflix", "adidas", "mercedes-benz",
  "bmw", "louis-vuitton", "chanel", "visa", "mastercard", "starbucks", "pepsi", "intel", "nvidia", "oracle",
  "meta", "uber", "paypal", "walmart", "costco", "disney", "cisco", "hp", "dell", "fedex",
  "airbnb", "shell", "hsbc", "siemens", "bosch", "porsche", "volkswagen", "audi", "ferrari", "gucci",
  "prada", "hermes", "loreal", "ikea", "spotify", "volvo", "philips", "heineken", "nestle", "rolex",
  "logitech", "canva", "atlassian", "qantas", "tsmc", "asus", "acer", "grab", "shopee", "airbus",
  "lufthansa", "renault", "peugeot", "dior", "zara", "carrefour", "unilever", "vodafone", "bbc", "tesco",
] as const;

const popularity = new Map<string, number>(popularIds.map((id, index) => [id, index]));

const chineseNames: Record<string, string> = {
  "x-cn-oppo": "OPPO",
  "x-cn-vivo": "vivo",
  "x-cn-zte": "中兴通讯",
  "x-cn-dji": "大疆创新",
  "x-cn-tcl": "TCL",
  "x-cn-hisense": "海信",
  "x-cn-midea": "美的",
  "x-cn-gree": "格力",
  "x-cn-netease": "网易",
  "x-cn-bilibili": "哔哩哔哩",
  "x-cn-jd-com": "京东",
  "x-cn-meituan": "美团",
  "x-cn-pinduoduo": "拼多多",
  "x-cn-iqiyi": "爱奇艺",
  "x-cn-kuaishou": "快手",
  "x-cn-didi": "滴滴出行",
  "x-cn-trip-com": "携程",
  "x-cn-geely": "吉利汽车",
  "x-cn-nio": "蔚来",
  "x-cn-xpeng": "小鹏汽车",
  "x-cn-icbc": "中国工商银行",
  "x-cn-bank-of-china": "中国银行",
  "x-cn-china-mobile": "中国移动",
  "x-cn-china-telecom": "中国电信",
  "x-cn-china-unicom": "中国联通",
  "x-cn-nongfu-spring": "农夫山泉",
  "x-cn-yili": "伊利",
  "x-cn-mengniu": "蒙牛",
  "x-cn-anta": "安踏",
  "x-cn-li-ning": "李宁",
  "x-us-coca-cola": "可口可乐",
  "x-us-mcdonald-s": "麦当劳",
  "x-us-nvidia": "英伟达",
  "x-us-meta": "Meta（元宇宙）",
  "x-us-paypal": "贝宝",
  "x-us-walmart": "沃尔玛",
  "x-us-costco": "开市客",
  "x-us-disney": "迪士尼",
  "x-us-fedex": "联邦快递",
  "x-jp-mazda": "马自达",
  "x-jp-subaru": "斯巴鲁",
  "x-jp-suzuki": "铃木",
  "x-jp-yamaha": "雅马哈",
  "x-jp-kawasaki": "川崎",
  "x-jp-bridgestone": "普利司通",
  "x-jp-fujifilm": "富士胶片",
  "x-jp-sharp": "夏普",
  "x-jp-toshiba": "东芝",
  "x-jp-hitachi": "日立",
  "x-jp-shiseido": "资生堂",
  "x-jp-suntory": "三得利",
  "x-jp-kirin": "麒麟",
  "x-kr-posco": "浦项制铁",
  "x-kr-hanwha": "韩华",
  "x-kr-doosan": "斗山",
  "x-kr-hybe": "HYBE",
  "x-fr-dior": "迪奥",
  "x-es-zara": "飒拉",
  "x-se-ikea": "宜家",
  "x-se-spotify": "声田",
  "x-nl-philips": "飞利浦",
  "x-nl-heineken": "喜力",
  "x-ch-nestle": "雀巢",
  "x-ch-rolex": "劳力士",
  "x-ch-logitech": "罗技",
  "x-au-canva": "可画",
  "x-tw-tsmc": "台积电",
  "x-sg-grab": "Grab",
  "x-sg-shopee": "虾皮",
};

const introductions: Record<string, string> = {
  apple: "消费电子与数字服务公司，主打 iPhone、Mac 和软件生态。",
  google: "互联网搜索、广告、云计算与软件服务公司。",
  microsoft: "软件、云计算与办公生产力服务公司。",
  amazon: "全球电商、云计算与数字内容服务公司。",
  samsung: "消费电子、半导体与家电制造企业。",
  toyota: "以乘用车和商用车为核心的汽车制造商。",
  nike: "运动鞋服与体育用品品牌。",
  tesla: "电动汽车、储能与清洁能源产品公司。",
  alibaba: "面向商家与消费者的电商和云计算集团。",
  tencent: "社交、游戏、内容与云服务互联网公司。",
  huawei: "通信设备、智能终端与企业数字化服务公司。",
  xiaomi: "智能手机、家电与智能硬件生态品牌。",
  byd: "新能源汽车、电池与轨道交通制造商。",
  sony: "消费电子、游戏、影视与音乐娱乐公司。",
  nintendo: "游戏主机、电子游戏与角色内容公司。",
  netflix: "订阅制影视流媒体服务。",
  adidas: "运动鞋服与体育用品品牌。",
  "mercedes-benz": "豪华乘用车与商用车品牌。",
  bmw: "豪华汽车与摩托车制造商。",
  "louis-vuitton": "皮具、时装与奢侈品品牌。",
  chanel: "高级时装、香水与美妆奢侈品牌。",
  starbucks: "连锁咖啡与零售消费品牌。",
  intel: "个人电脑和数据中心芯片公司。",
  airbnb: "短期住宿与旅行体验预订平台。",
  shell: "石油、天然气与能源服务集团。",
  siemens: "工业自动化、基础设施与能源技术公司。",
  bosch: "汽车零部件、家电与工业技术制造商。",
  porsche: "高性能跑车与豪华汽车品牌。",
  volkswagen: "覆盖多品牌乘用车与商用车的汽车集团。",
  audi: "豪华乘用车品牌。",
  ferrari: "高性能跑车与赛车品牌。",
  gucci: "时装、皮具与奢侈品品牌。",
  prada: "时装、皮具与奢侈品品牌。",
  hermes: "皮具、丝巾与高端奢侈品品牌。",
  loreal: "护肤、彩妆与个人护理集团。",
  "x-us-coca-cola": "软饮料与饮品品牌集团。",
  "x-us-mcdonald-s": "全球连锁快餐与餐饮品牌。",
  "x-us-nvidia": "图形处理器、AI 计算与数据中心芯片公司。",
  "x-us-meta": "社交网络、通信与虚拟现实产品公司。",
  "x-us-paypal": "在线支付与数字金融服务公司。",
  "x-us-walmart": "大型零售与会员制电商集团。",
  "x-us-costco": "会员制仓储零售商。",
  "x-us-disney": "影视、流媒体、主题乐园与娱乐内容集团。",
  "x-us-fedex": "全球快递、物流与供应链服务公司。",
  "x-se-ikea": "家具、家居用品与零售品牌。",
  "x-se-spotify": "音乐、播客与有声内容流媒体平台。",
  "x-nl-philips": "健康科技、医疗设备与个人健康产品公司。",
  "x-nl-heineken": "啤酒与饮料品牌集团。",
  "x-ch-nestle": "食品、饮料与营养健康产品集团。",
  "x-ch-rolex": "高端机械腕表品牌。",
  "x-ch-logitech": "电脑外设、游戏设备与协作工具品牌。",
  "x-au-canva": "在线视觉设计与内容创作平台。",
  "x-tw-tsmc": "为全球芯片公司提供晶圆制造服务的半导体企业。",
  "x-sg-grab": "覆盖出行、外卖、支付与金融服务的平台。",
  "x-sg-shopee": "东南亚与拉美市场的电商平台。",
};

const categoryIntroductions: Record<string, string> = {
  "科技与电子": "科技与电子企业，提供消费电子、软件或数字技术产品与服务",
  "互联网与媒体": "互联网与媒体品牌，提供在线内容、社交、娱乐或数字平台服务",
  "汽车与出行": "汽车与出行企业，从事汽车、航空、物流或出行相关业务",
  "金融": "金融机构，提供银行、支付、保险或投资服务",
  "零售与电商": "零售与电商品牌，经营零售、电子商务或消费商品",
  "时尚与奢侈品": "时尚与奢侈品品牌，经营服饰、运动用品、设计或奢侈品",
  "食品与饮料": "食品与饮料品牌，生产或经营食品、饮料与餐饮产品",
  "通信": "通信企业，提供电信网络、连接或通信服务",
  "旅行与酒店": "旅行与酒店品牌，提供旅行、住宿或旅游服务",
  "工业与能源": "工业与能源企业，从事制造、基础设施、能源或工业技术业务",
  "美妆与个护": "美妆与个护品牌，提供美容、护肤或个人护理产品",
};

export const getChineseName = (brand: CardBrand) => {
  const explicit = chineseNames[brand.id];
  if (explicit) return explicit;
  if (brand.zhName && brand.zhName !== brand.name) return brand.zhName;
  const reading = brand.reading.replaceAll("-", "").trim();
  return /[\u3400-\u9fff]/.test(reading) && !reading.includes("待补") ? reading : "暂无常用中文名";
};

export const getBrandIntroduction = (brand: CardBrand) =>
  introductions[brand.id] ?? `来自${brand.country}的${categoryIntroductions[brand.category] ?? "品牌与服务企业"}。`;

export const getPopularityRank = (brand: CardBrand) => {
  const rank = popularity.get(brand.id);
  if (rank !== undefined) return rank;
  const stableWeight = [...brand.id].reduce((sum, character) => (sum * 31 + character.charCodeAt(0)) % 9_000, 0);
  return (brand.id.startsWith("x-") ? 10_000 : 1_000) + stableWeight;
};

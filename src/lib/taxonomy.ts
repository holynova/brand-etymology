export const categorySlugs: Record<string, string> = {
  "科技与电子": "technology",
  "互联网与媒体": "internet-media",
  "汽车与出行": "automotive",
  "金融": "finance",
  "零售与电商": "retail",
  "时尚与奢侈品": "fashion-luxury",
  "食品与饮料": "food-beverage",
  "通信": "telecom",
  "旅行与酒店": "travel-hospitality",
  "工业与能源": "industrial-energy",
  "美妆与个护": "beauty-personal-care",
};

export const confidenceLabel = {
  confirmed: "已确认",
  probable: "较可信",
  disputed: "有争议",
} as const;

export const countryMeta = {
  CN: { name: "中国", flag: "🇨🇳" },
  JP: { name: "日本", flag: "🇯🇵" },
  KR: { name: "韩国", flag: "🇰🇷" },
  US: { name: "美国", flag: "🇺🇸" },
  GB: { name: "英国", flag: "🇬🇧" },
  FR: { name: "法国", flag: "🇫🇷" },
  IT: { name: "意大利", flag: "🇮🇹" },
  DE: { name: "德国", flag: "🇩🇪" },
} as const;

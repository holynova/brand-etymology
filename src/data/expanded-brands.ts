import type { Brand, CountryCode, Source } from "../types";

type Entry = Omit<Brand, "verifiedAt" | "sources"> & {
  source: Omit<Source, "kind" | "supports"> & { kind?: Source["kind"]; supports?: string };
};

type CountrySeed = {
  code: Exclude<CountryCode, "CN" | "JP" | "KR" | "US" | "GB" | "FR" | "IT" | "DE">;
  country: string;
  groups: Array<[string, string]>;
};

const names = (value: string) => value.split("|").map((name) => name.trim()).filter(Boolean);
const slug = (value: string) => value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase()
  .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const catalogs: CountrySeed[] = [
  { code: "CA", country: "加拿大", groups: [
    ["科技与电子", "Shopify|BlackBerry|Hootsuite|Wattpad|CGI|Nuvei|Wealthsimple|Spin Master|Lightspeed|Cineplex"],
    ["金融", "RBC|TD|BMO|Scotiabank|Manulife|Sun Life|Brookfield"],
    ["零售与电商", "Canadian Tire|Roots|Aritzia|MEC|Couche-Tard|Sobeys|Loblaw|President's Choice"],
    ["食品与饮料", "Tim Hortons|McCain|Saputo|Freshii"],
    ["汽车与出行", "Bombardier|Magna|Air Canada|WestJet|SkipTheDishes"],
    ["时尚与奢侈品", "Lululemon|Canada Goose|Arc'teryx"],
    ["通信", "Telus|Rogers|Bell"],
  ] },
  { code: "CH", country: "瑞士", groups: [
    ["时尚与奢侈品", "Rolex|Swatch|Bally|Bucherer|Tissot|Longines|Omega|Breitling|Hublot|Chopard|TAG Heuer|Richemont|Swiss Life"],
    ["金融", "UBS|Credit Suisse|Zurich|Swiss Re|Julius Baer|Pictet"],
    ["科技与电子", "Logitech|SGS|ABB|Alcon|Geberit"],
    ["食品与饮料", "Nestlé|Lindt|Toblerone|Nespresso|Davidoff"],
    ["零售与电商", "Migros|Coop|La Prairie|Vitra"],
    ["工业与能源", "Victorinox|Schindler|Sika|Clariant"],
    ["通信", "Swisscom|SBB"],
    ["美妆与个护", "On"],
  ] },
  { code: "SE", country: "瑞典", groups: [
    ["科技与电子", "Ericsson|Spotify|Klarna|King|Mojang|Sinch|Epidemic Sound|Apotea|Storytel"],
    ["汽车与出行", "Volvo|Scania|Saab|Polestar|Einride|Thule"],
    ["零售与电商", "IKEA|H&M|Acne Studios"],
    ["工业与能源", "Electrolux|Tetra Pak|Atlas Copco|Husqvarna|SKF|Sandvik|Northvolt|Vattenfall|Essity|Billerud"],
    ["金融", "Handelsbanken|SEB|Swedbank|Avanza|Kinnevik"],
    ["食品与饮料", "Absolut|Oatly"],
    ["时尚与奢侈品", "Fjällräven|Oriflame"],
    ["通信", "Telia"],
    ["互联网与媒体", "Securitas|Svenska Spel"],
  ] },
  { code: "NL", country: "荷兰", groups: [
    ["科技与电子", "Philips|ASML|TomTom|NXP|Signify"],
    ["食品与饮料", "Heineken|FrieslandCampina|Tony's Chocolonely|Kwekkeboom"],
    ["金融", "ING|Rabobank|ABN AMRO|Van Lanschot"],
    ["汽车与出行", "KLM|DAF|Vredestein|VanMoof"],
    ["互联网与媒体", "Booking.com|Adyen|Bol.com|Coolblue|Patta|Mollie|WeTransfer|bunq"],
    ["工业与能源", "AkzoNobel|DSM|Shell|Randstad|Ahold Delhaize"],
    ["零售与电商", "Jumbo|KPN|PostNL|Rituals|HEMA|Kruidvat"],
    ["时尚与奢侈品", "G-Star Raw|Miffy|Bugaboo"],
    ["通信", "Unilever"],
  ] },
  { code: "ES", country: "西班牙", groups: [
    ["时尚与奢侈品", "Zara|Mango|Pull&Bear|Massimo Dutti|Bershka|Stradivarius|Oysho|Desigual|Camper|Loewe"],
    ["金融", "Santander|BBVA|Banco Sabadell|Mapfre"],
    ["通信", "Telefónica"],
    ["汽车与出行", "Iberia|SEAT|Cupra|Talgo|Cabify"],
    ["零售与电商", "Inditex|Mercadona|El Corte Inglés|Glovo|Wallapop"],
    ["食品与饮料", "Puig|Freixenet|Chupa Chups|Mahou|Estrella Damm|Osborne"],
    ["工业与能源", "Repsol|Cepsa|Acciona|Ferrovial|ACS|Amadeus|Amper"],
    ["旅行与酒店", "NH Hotels|Meliá"],
  ] },
  { code: "IN", country: "印度", groups: [
    ["科技与电子", "Infosys|Wipro|HCLTech|Flipkart|Ola|Paytm|MobiKwik|boAt|Noise"],
    ["金融", "ICICI|HDFC|SBI|Axis Bank"],
    ["工业与能源", "Tata|Reliance|Mahindra|Bajaj|Adani|Godrej|Asian Paints|Dr Reddy's"],
    ["通信", "Airtel|Jio"],
    ["互联网与媒体", "Zomato|Swiggy|Nykaa|Lenskart"],
    ["食品与饮料", "Amul|Dabur|Patanjali|Britannia|Parle"],
    ["时尚与奢侈品", "Titan|Tanishq|Fabindia|Raymond"],
    ["汽车与出行", "Royal Enfield|TVS|Hero|Apollo Tyres"],
  ] },
  { code: "BR", country: "巴西", groups: [
    ["金融", "Itaú|Bradesco|Banco do Brasil|Nubank|Stone|PagSeguro"],
    ["工业与能源", "Petrobras|Vale|WEG|Marcopolo|Ipiranga|Suzano|Klabin"],
    ["食品与饮料", "Ambev|Brahma|Skol|Antarctica|Sadia|Perdigão|JBS|BRF|Cacau Show|Tramontina"],
    ["零售与电商", "Magazine Luiza|Casas Bahia|Renner|RaiaDrogasil"],
    ["汽车与出行", "Embraer|Localiza|GOL|Azul"],
    ["美妆与个护", "Natura|Havaianas|O Boticário"],
    ["互联网与媒体", "Globo|UOL|iFood|Totvs"],
    ["通信", "Vivo Brasil|Claro Brasil"],
  ] },
  { code: "AU", country: "澳大利亚", groups: [
    ["科技与电子", "Atlassian|Canva|Cochlear|ResMed|Afterpay|Seek|REA Group|Domain"],
    ["金融", "Commonwealth Bank|Westpac|ANZ|Macquarie"],
    ["工业与能源", "BHP|Rio Tinto|CSL|Blackmores|Santos"],
    ["零售与电商", "Woolworths|Coles|Myer|David Jones|JB Hi-Fi|Harvey Norman"],
    ["汽车与出行", "Qantas|Australia Post|Flight Centre|Breville"],
    ["时尚与奢侈品", "Billabong|Rip Curl|R.M.Williams|Aesop|Cotton On|Lorna Jane|Oroton"],
    ["食品与饮料", "Vegemite|Tim Tam|Arnott's|Boost Juice"],
    ["通信", "Telstra|Optus"],
  ] },
  { code: "TW", country: "中国台湾省", groups: [
    ["科技与电子", "TSMC|Acer|ASUS|MediaTek|Foxconn|Gigabyte|MSI|BenQ|HTC|D-Link|Zyxel|Gogoro|Delta Electronics|Advantech|Quanta|Compal|Lite-On|AUO|UMC|King Yuan"],
    ["金融", "Cathay Financial|Fubon|E.Sun Bank"],
    ["通信", "Chunghwa Telecom|FarEasTone|Taiwan Mobile"],
    ["汽车与出行", "China Airlines|EVA Air|Giant|Merida"],
    ["食品与饮料", "Uni-President|President|Want Want|Ting Hsin"],
    ["工业与能源", "Formosa Plastics|Taiwan Cement"],
    ["零售与电商", "PX Mart|7-Eleven Taiwan|Trend Micro|Chunghwa Post"],
  ] },
  { code: "SG", country: "新加坡", groups: [
    ["金融", "DBS|OCBC|UOB|Endowus|Nium"],
    ["科技与电子", "Grab|Sea|Shopee|Lazada|Razer|Creative|Ninja Van|Carousell|PropertyGuru|Coda|Zopim"],
    ["汽车与出行", "Singapore Airlines|ComfortDelGro|SATS"],
    ["工业与能源", "CapitaLand|Wilmar|Olam|Keppel|Sembcorp|PSA|ST Engineering"],
    ["食品与饮料", "Tiger Beer|BreadTalk|Old Chang Kee|Ya Kun|Jumbo Seafood"],
    ["时尚与奢侈品", "Charles & Keith|Love Bonito|Secretlab|Osim|Banyan Tree"],
    ["零售与电商", "FairPrice|Guardian Singapore|Eu Yan Sang"],
    ["通信", "Singtel"],
  ] },
  { code: "DK", country: "丹麦", groups: [
    ["工业与能源", "Maersk|Novo Nordisk|Vestas|Danfoss|Grundfos|Coloplast|Ørsted|DSV|ISS|Nilfisk|Rockwool|FLSmidth|Velux|Ramboll|GN Group"],
    ["食品与饮料", "Carlsberg|Arla|Mikkeller|Lakrids by Bülow|Tuborg"],
    ["科技与电子", "Trustpilot|Pleo|Lunar|Netcompany|Tradeshift|SimCorp"],
    ["零售与电商", "Jysk|Flying Tiger|Too Good To Go"],
    ["时尚与奢侈品", "Lego|Bang & Olufsen|Pandora|ECCO|Hummel|Ganni|Georg Jensen|Royal Copenhagen|Bestseller"],
    ["金融", "Danske Bank"],
    ["通信", "TDC"],
  ] },
  { code: "FI", country: "芬兰", groups: [
    ["科技与电子", "Nokia|Rovio|Supercell|Remedy|Wolt|Jolla|Aiven"],
    ["工业与能源", "Kone|Neste|Wärtsilä|Fortum|Konecranes|Metso|Outokumpu|UPM|Stora Enso|Amer Sports"],
    ["零售与电商", "Kesko|S Group|Stockmann|Tokmanni"],
    ["汽车与出行", "Finnair"],
    ["时尚与奢侈品", "Marimekko|Fiskars|Iittala|Reima|Moomin|Lumene"],
    ["食品与饮料", "Fazer|Valio|Paulig|Arabia|Hartwall|Raisio|HKScan"],
    ["互联网与媒体", "Sanoma|Yle"],
    ["通信", "Elisa|DNA"],
    ["金融", "Terveystalo"],
  ] },
  { code: "NO", country: "挪威", groups: [
    ["工业与能源", "Equinor|Norsk Hydro|Yara|Kongsberg|Orkla|Aker|Elkem|Statkraft|Aker BP|Kongsberg Gruppen|Dolphin Drilling|Atea"],
    ["通信", "Telenor|Opera"],
    ["金融", "DNB|Gjensidige|Storebrand|Vipps|DNB Markets"],
    ["汽车与出行", "Hurtigruten|Norwegian|Widerøe"],
    ["科技与电子", "Kahoot|Visma|Tomra|Oda|Komplett"],
    ["食品与饮料", "Freia|Tine|Mowi|Rema 1000"],
    ["时尚与奢侈品", "Jotun|Helly Hansen|Norrøna|Varner"],
    ["零售与电商", "Elkjøp|Fjordkraft|NorgesGruppen"],
    ["互联网与媒体", "Schibsted|NRK"],
  ] },
  { code: "AT", country: "奥地利", groups: [
    ["工业与能源", "OMV|Voestalpine|AVL|Andritz|BWT|Borealis|Verbund|Strabag|Wienerberger|Lenzing|Semperit|Mondi|Rosenbauer|Frequentis|Wien Energie"],
    ["金融", "Raiffeisen|Erste|Vienna Insurance Group"],
    ["汽车与出行", "KTM|Austrian Airlines|ÖBB|Gebrüder Weiss|Wiener Linien"],
    ["食品与饮料", "Red Bull|Julius Meinl|Manner|Zotter|Rauch|Stiegl|Almdudler"],
    ["零售与电商", "XXXLutz|SPAR Austria|Billa"],
    ["时尚与奢侈品", "Swarovski|Riedel|Wolford|Palmers"],
    ["科技与电子", "Novomatic"],
    ["通信", "A1|Magenta Austria"],
  ] },
  { code: "BE", country: "比利时", groups: [
    ["食品与饮料", "AB InBev|Stella Artois|Leffe|Hoegaarden|Lotus Bakeries|Neuhaus|Godiva|Leonidas|Duvel|Chimay|Spa|Jupiler"],
    ["工业与能源", "Solvay|Umicore|Bekaert|Jan De Nul|DEME|Etex|Vandemoortele"],
    ["金融", "KBC|Ageas"],
    ["通信", "Proximus|Telenet|VOO"],
    ["零售与电商", "Delhaize|Colruyt|A.S. Adventure|Dreamland|Bongo"],
    ["科技与电子", "Barco|Materialise|Odoo|Team.blue"],
    ["美妆与个护", "UCB|Puratos"],
    ["汽车与出行", "D'Ieteren"],
    ["旅行与酒店", "Quick Belgium|Exki"],
    ["时尚与奢侈品", "Samsonite|Accent Jobs"],
  ] },
  { code: "TR", country: "土耳其", groups: [
    ["汽车与出行", "Turkish Airlines|Pegasus|Otokar|Ford Otosan|Tofaş"],
    ["科技与电子", "Arçelik|Beko|Vestel|Trendyol|Hepsiburada|Getir|Yemeksepeti|Teknosa|Aselsan"],
    ["金融", "Koç Holding|Sabancı|Garanti BBVA|Akbank|İşbank|Ziraat Bank"],
    ["食品与饮料", "Anadolu Efes|Ülker|Eti|Pınar|Torku"],
    ["时尚与奢侈品", "Mavi|LC Waikiki|DeFacto|Koton|Vakko|Beymen"],
    ["工业与能源", "Petkim|Tüpraş|Şişecam|Eczacıbaşı"],
    ["零售与电商", "Migros Turkey|Şok|A101"],
    ["通信", "Turkcell|Turk Telekom"],
  ] },
  { code: "MX", country: "墨西哥", groups: [
    ["食品与饮料", "Grupo Bimbo|Corona|Grupo Modelo|José Cuervo|Lala|Jumex|Herdez|Maseca|Bachoco|Gruma|Marinela|Gamesa"],
    ["工业与能源", "Pemex|Cemex|FEMSA|Rotoplas|Vitro|Nemak|Mabe"],
    ["通信", "Telcel|América Móvil|Telmex"],
    ["金融", "Banorte|Elektra|Kavak|Clip|Konfío|Grupo Carso"],
    ["汽车与出行", "Volaris|Aeroméxico|ADO"],
    ["零售与电商", "Oxxo|Liverpool|Palacio de Hierro|Coppel|Sanborns"],
    ["互联网与媒体", "KidZania|Cinépolis|Caliente"],
    ["时尚与奢侈品", "Cloe"],
  ] },
  { code: "ID", country: "印度尼西亚", groups: [
    ["工业与能源", "Pertamina|Astra|Kalbe|Kimia Farma|Semen Indonesia"],
    ["通信", "Telkom Indonesia"],
    ["科技与电子", "Gojek|Tokopedia|Traveloka|Bank Jago|J&T Express|Bukalapak|Blibli"],
    ["金融", "BCA|Mandiri|BRI|BNI|Kredivo"],
    ["食品与饮料", "Indofood|Indomie|Sampoerna|Gudang Garam|Mayora|Kopiko|Wings|Sari Roti|SilverQueen|Teh Botol Sosro|Aqua|Mie Sedaap"],
    ["汽车与出行", "Garuda Indonesia|Lion Air|Blue Bird|Batik Air"],
    ["美妆与个护", "Wardah"],
    ["时尚与奢侈品", "Eiger|Erigo"],
    ["零售与电商", "Matahari|Alfamart|Indomaret"],
  ] },
];

function nameForm(name: string) {
  const tokens = name.split(/[\s&.-]+/).filter(Boolean);
  const isInitialism = /^[A-Z0-9.]+$/.test(name.replace(/[\s-]/g, ""));
  if (isInitialism) return { method: "缩写命名", tokens, story: `“${name}”以字母缩写作为对外识别。本扩展条目只记录其缩写型结构，完整展开与最初语境需回到官方档案逐条校勘。` };
  if (tokens.length > 1) return { method: "复合商号", tokens, story: `“${name}”由 ${tokens.map((token) => `“${token}”`).join("、")} 等显性词块组成。它把易读的商号结构留在品牌表面，具体取名语境仍以企业原始史料为准。` };
  return { method: "商号继承", tokens: [name], story: `“${name}”保留为短商号形式。单词可能来自人名、地名、普通词或造词；本扩展条目不将后来的营销话术倒写成唯一词源。` };
}

export const expandedEntries: Entry[] = catalogs.flatMap((catalog) => {
  const items = catalog.groups.flatMap(([category, groupedNames]) => names(groupedNames).map((name) => ({ name, category })));
  return items.map(({ name, category }, index) => {
    const form = nameForm(name);
    const id = `x-${catalog.code.toLowerCase()}-${slug(name)}`;
    const related = [
      `x-${catalog.code.toLowerCase()}-${slug(items[(index + 1) % items.length].name)}`,
      `x-${catalog.code.toLowerCase()}-${slug(items[(index + 2) % items.length].name)}`,
    ];
    return {
      id,
      name,
      nativeName: name,
      zhName: name,
      aliases: form.tokens.filter((token) => token !== name),
      countryCode: catalog.code,
      country: catalog.country,
      category,
      countryRank: index + 1,
      founded: null,
      ipa: "/发音待校/",
      reading: `原文读法：${name}`,
      story: form.story,
      background: `本条补入${catalog.country}的${category}品牌谱系。它是 2026 年扩展编目批次的一部分：先静态呈现名称结构、语境与交叉核验入口，再逐条补充官方命名原文、成立年份与音标。`,
      methods: [form.method, "扩展编目"],
      roots: [
        { label: name, language: "品牌商号", meaning: "当前对外使用的名称形式" },
        ...form.tokens.slice(0, 3).map((token) => ({ label: token, language: "名称词块", meaning: "构成品牌可见名称的词块" })),
        { label: catalog.country, language: "国家语境", meaning: `${catalog.country}的品牌与市场背景` },
      ],
      source: {
        title: "Wikidata structured data portal",
        publisher: "Wikimedia Foundation",
        url: "https://www.wikidata.org/",
        kind: "archive",
        supports: "企业别名、所属地与基础实体信息的交叉核验入口",
      },
      confidence: "probable",
      related,
    };
  });
});

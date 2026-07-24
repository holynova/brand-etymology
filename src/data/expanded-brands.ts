import type { Brand, CountryCode, Source } from "../types";
import originAudit from "./wikidata-name-origins.json";
import webResearch from "./bing-name-origin-research.json";
import chatgptOrigins from "./chatgpt-name-origins.json";

type Entry = Omit<Brand, "verifiedAt" | "sources"> & {
  source: Omit<Source, "kind" | "supports"> & { kind?: Source["kind"]; supports?: string };
};

type CountrySeed = {
  code: CountryCode;
  country: string;
  groups: Array<[string, string]>;
};

const names = (value: string) => value.split("|").map((name) => name.trim()).filter(Boolean);
const slug = (value: string) => value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase()
  .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const catalogs: CountrySeed[] = [
  { code: "CN", country: "中国", groups: [
    ["科技与电子", "OPPO|vivo|ZTE|DJI|TCL|Hisense|Midea|Gree|NetEase|Bilibili"],
    ["互联网与媒体", "JD.com|Meituan|Pinduoduo|iQIYI|Kuaishou|Didi|Trip.com"],
    ["汽车与出行", "Geely|NIO|XPeng"],
    ["金融", "ICBC|Bank of China"],
    ["通信", "China Mobile|China Telecom|China Unicom"],
    ["食品与饮料", "Nongfu Spring|Yili|Mengniu"],
    ["时尚与奢侈品", "Anta|Li-Ning"],
  ] },
  { code: "JP", country: "日本", groups: [
    ["汽车与出行", "Mazda|Subaru|Suzuki|Yamaha|Kawasaki|Bridgestone|ANA|Japan Airlines"],
    ["科技与电子", "Seiko|Casio|Fujifilm|Ricoh|Sharp|NEC|Toshiba|Hitachi"],
    ["时尚与奢侈品", "Asics|Shiseido|Kao"],
    ["食品与饮料", "Yakult|Suntory|Kirin|Nissin"],
    ["互联网与媒体", "Bandai Namco|Sega|Konami|Rakuten|LINE|Mercari"],
    ["工业与能源", "Komatsu"],
  ] },
  { code: "KR", country: "韩国", groups: [
    ["工业与能源", "Daewoo|POSCO|Hanwha|Doosan|GS|CJ|Korea Zinc|LG Energy Solution"],
    ["通信", "KT|LG U+"],
    ["零售与电商", "Shinsegae|E-Mart"],
    ["金融", "Shinhan|KB|Woori"],
    ["汽车与出行", "Hanjin|Korean Air|Asiana Airlines|Hyundai Mobis|Kumho Tire|Hankook Tire"],
    ["互联网与媒体", "YG Entertainment|JYP Entertainment|HYBE|Nexon|NCSoft|Krafton"],
    ["食品与饮料", "Ottogi|Orion|Paris Baguette"],
  ] },
  { code: "US", country: "美国", groups: [
    ["科技与电子", "Meta|Intel|IBM|Oracle|Cisco|HP|Dell|NVIDIA|Qualcomm|Salesforce"],
    ["互联网与媒体", "Uber|Lyft|Disney|Warner Bros.|LinkedIn|eBay|PayPal"],
    ["零售与电商", "Walmart|Costco|Target|The Home Depot"],
    ["食品与饮料", "McDonald's|Coca-Cola|Pepsi"],
    ["汽车与出行", "Boeing|Ford|General Motors|FedEx"],
    ["金融", "Visa|Mastercard"],
  ] },
  { code: "GB", country: "英国", groups: [
    ["汽车与出行", "Aston Martin|Bentley|Land Rover|MINI|McLaren|British Airways|easyJet"],
    ["零售与电商", "Marks & Spencer|Sainsbury's|Asda|Boots|John Lewis|Harrods"],
    ["金融", "Barclays|Lloyds Bank|NatWest|Standard Chartered"],
    ["工业与能源", "BP|Unilever|GSK|AstraZeneca|BAE Systems"],
    ["食品与饮料", "Diageo|Cadbury|Twinings"],
    ["互联网与媒体", "The Guardian|The Economist|Sky"],
    ["通信", "BT|O2"],
  ] },
  { code: "FR", country: "法国", groups: [
    ["时尚与奢侈品", "Dior|Saint Laurent|Cartier|Lancôme|Guerlain|Givenchy|Lacoste"],
    ["零售与电商", "Decathlon|Auchan"],
    ["食品与饮料", "Danone|Perrier|Evian|Moët & Chandon|Hennessy|Pernod Ricard"],
    ["汽车与出行", "Citroën|Bugatti"],
    ["工业与能源", "Dassault|Thales|Safran|Alstom|TotalEnergies|Schneider Electric"],
    ["金融", "BNP Paribas|Société Générale|AXA"],
    ["旅行与酒店", "Accor|Club Med"],
    ["互联网与媒体", "Ubisoft|BlaBlaCar"],
  ] },
  { code: "IT", country: "意大利", groups: [
    ["汽车与出行", "Maserati|Alfa Romeo|Ducati|Aprilia|Piaggio|Pirelli|Trenitalia|ITA Airways"],
    ["时尚与奢侈品", "Fendi|Valentino|Dolce & Gabbana|Bottega Veneta|Moncler|Tod's|Salvatore Ferragamo|Benetton"],
    ["食品与饮料", "Illy|Ferrero|Nutella|Campari|Aperol|San Pellegrino"],
    ["工业与能源", "Eni|Enel|Leonardo"],
    ["金融", "Intesa Sanpaolo|UniCredit|Poste Italiane"],
    ["零售与电商", "Esselunga|Coop Italia"],
  ] },
  { code: "DE", country: "德国", groups: [
    ["工业与能源", "Bayer|BASF|Henkel|Continental|Miele|Kärcher|Infineon|Merck|Knorr-Bremse|E.ON|RWE|Rheinmetall"],
    ["科技与电子", "SAP|Zeiss|Leica"],
    ["金融", "Deutsche Bank|Allianz"],
    ["汽车与出行", "Lufthansa|Deutsche Post DHL|Fraport"],
    ["零售与电商", "Zalando|Aldi|Lidl|Metro|Otto|Fielmann"],
    ["美妆与个护", "Nivea|Beiersdorf"],
    ["食品与饮料", "Dr. Oetker"],
    ["旅行与酒店", "TUI"],
  ] },
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

type AuditRecord = { id: string; label: string; description: string; namedAfter: Array<{ id: string; label: string; description: string }> } | null;
type EditorialOrigin = {
  story: string;
  background: string;
  roots: Array<{ label: string; language: string; meaning: string }>;
  source: Entry["source"];
  confidence: "confirmed" | "probable";
};

const audits = originAudit as Record<string, AuditRecord>;
type WebResult = { title: string; url: string; domain: string; snippet: string };
type WebResearch = { query: string; status: string; results: WebResult[] };
type ChatGPTOrigin = {
  ipa: string;
  reading: string;
  story: string;
  background: string;
  methods: string[];
  roots: Array<{ label: string; language: string; meaning: string }>;
  confidence: "probable" | "pending";
  evidence: string;
};
const webOrigins = webResearch as Record<string, WebResearch>;
const generatedOrigins = chatgptOrigins as Record<string, ChatGPTOrigin>;

function candidateSource(id: string) {
  const candidates = webOrigins[id]?.results ?? [];
  const evidence = /\b(name|origin|named|etymology|acronym|meaning|stands for|derived)\b/i;
  return candidates.find((candidate) => evidence.test(`${candidate.title} ${candidate.snippet}`)) ?? candidates[0];
}

// 只有品牌自有资料能直接支持命名关系时，才升级为已确认；结构化数据库仅用于发现线索。
const editorialOrigins: Record<string, EditorialOrigin> = {
  "x-se-ikea": {
    story: "IKEA 是 Ingvar Kamprad、Elmtaryd 与 Agunnaryd 的首字母缩写：分别取自创始人、他成长的农场和所在教区。",
    background: "1943 年，17 岁的 Ingvar Kamprad 创立公司时，将自己的姓名首字母与故乡的两个地名组合为 IKEA。它不是一个瑞典普通词，而是一组个人与成长地点的缩写。",
    roots: [
      { label: "I", language: "人名首字母", meaning: "Ingvar Kamprad" },
      { label: "E", language: "地名首字母", meaning: "Elmtaryd 农场" },
      { label: "A", language: "地名首字母", meaning: "Agunnaryd 教区" },
    ],
    source: {
      title: "The IKEA story: Ingvar Kamprad",
      publisher: "IKEA",
      url: "https://www.ikea.com/se/sv/files/pdf/fc/0d/fc0d7ed3/ik-general-obituary-28-01-18.pdf",
      kind: "official",
      supports: "说明 IKEA 由 Ingvar Kamprad、Elmtaryd 和 Agunnaryd 的首字母组成",
    },
    confidence: "confirmed",
  },
  "x-se-ericsson": {
    story: "Ericsson 沿用创办人 Lars Magnus Ericsson 的姓氏。公司最初注册为 L. M. Ericsson & Co.，后来以创始人姓氏作为对外品牌。",
    background: "这是一种典型的创始人姓氏商号命名：名称首先标记的是公司创办者，而不是一项通信技术或抽象概念。",
    roots: [
      { label: "Ericsson", language: "瑞典姓氏", meaning: "创办人 Lars Magnus Ericsson 的姓氏" },
      { label: "L. M. Ericsson & Co.", language: "早期公司名", meaning: "公司最初的注册名称形式" },
    ],
    source: {
      title: "Creating a brand",
      publisher: "Ericsson",
      url: "https://www.ericsson.com/en/about-us/history/company/brand-names-and-marketing/creating-a-brand",
      kind: "official",
      supports: "说明公司早期注册名为 L. M. Ericsson & Co.，名称来自创办人 Lars Magnus Ericsson",
    },
    confidence: "confirmed",
  },
  "x-ch-logitech": {
    story: "Logitech 是法语 logiciel（“软件”）与 tech 的拼合；名称把公司早期的软件背景和技术定位压缩在一个国际化短词中。",
    background: "该名称不是创办人姓氏，而是以法语技术词为起点的混成词。网站保留其法语词根与英语技术缩略两层结构。",
    roots: [{ label: "logiciel", language: "法语", meaning: "软件" }, { label: "tech", language: "英语缩略", meaning: "technology，技术" }],
    source: { title: "Logitech", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Logitech", kind: "archive", supports: "条目明确说明名称由 logiciel 与 tech 拼合" },
    confidence: "probable",
  },
  "x-ch-migros": {
    story: "Migros 来自法语 mi（“半、中间”）与 gros（“批发”）：名称最初指向介于零售与批发之间的经营方式。",
    background: "名称本身记录了创办时的商业定位，而非地名或人名。法语构词被直接保留为瑞士零售品牌。",
    roots: [{ label: "mi", language: "法语", meaning: "半、中间" }, { label: "gros", language: "法语", meaning: "批发" }],
    source: { title: "Migros", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Migros", kind: "archive", supports: "条目说明名称来自法语 mi 与 gros" },
    confidence: "probable",
  },
  "x-se-acne-studios": {
    story: "Acne Studios 的 ACNE 最初是 Associated Computer Nerd Enterprises 的缩写；品牌后来也使用 Ambition to Create Novel Expressions 这一回溯式释义。",
    background: "这里需要区分原始缩写与后来的品牌阐释：两者都被记录，但不应把后设释义倒写成最初命名动机。",
    roots: [{ label: "ACNE", language: "英语首字母缩写", meaning: "Associated Computer Nerd Enterprises" }, { label: "ACNE", language: "后设释义", meaning: "Ambition to Create Novel Expressions" }],
    source: { title: "Acne Studios", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Acne_Studios", kind: "archive", supports: "条目区分原始缩写和后来的 backronym" },
    confidence: "probable",
  },
  "x-se-tetra-pak": {
    story: "Tetra Pak 得名于公司采用的四面体（tetrahedron）纸盒：tetra 指“四面体”，Pak 则提示包装。",
    background: "产品结构直接成为公司名称，命名把工程上的几何形状和包装用途并置。",
    roots: [{ label: "tetrahedron", language: "英语几何术语", meaning: "四面体" }, { label: "Pak", language: "品牌拼写", meaning: "pack 的包装联想" }],
    source: { title: "Tetra Pak", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Tetra_Pak", kind: "archive", supports: "条目说明名称源自四面体形纸盒" },
    confidence: "probable",
  },
  "x-se-essity": {
    story: "Essity 由 essentials 与 necessity 两个英语词拼合，强调“必需的卫生与健康用品”这一品牌定位。",
    background: "这是一次以品类价值为中心的造词：不直接描述某项产品，而把“必需性”做成可注册的短品牌。",
    roots: [{ label: "essentials", language: "英语", meaning: "必需品" }, { label: "necessity", language: "英语", meaning: "必要、必需品" }],
    source: { title: "Essity", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Essity", kind: "archive", supports: "条目说明名称由 essentials 和 necessity 派生" },
    confidence: "probable",
  },
  "x-nl-ahold-delhaize": {
    story: "Ahold Delhaize 是 2016 年 Ahold 与 Delhaize Group 合并后并列的两家公司名称。",
    background: "它不是另造词，而是企业合并的可读记录：两个既有零售集团的名字都被保留在新集团名称中。",
    roots: [{ label: "Ahold", language: "公司名", meaning: "合并前荷兰零售集团" }, { label: "Delhaize", language: "公司名", meaning: "合并前比利时零售集团" }],
    source: { title: "Ahold Delhaize", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Ahold_Delhaize", kind: "archive", supports: "条目说明名称来自 2016 年两家公司合并" },
    confidence: "probable",
  },
  "x-es-mapfre": {
    story: "MAPFRE 是 Mutualidad de la Agrupación de Propietarios de Fincas Rústicas de España 的首字母缩写，记录了它作为农村地产所有者互助组织的早期身份。",
    background: "今天品牌以 MAPFRE 对外使用，但字母串保留了最初西班牙语组织名称的完整历史来源。",
    roots: [{ label: "MAPFRE", language: "西班牙语首字母缩写", meaning: "早期互助组织全称的缩写" }],
    source: { title: "MAPFRE", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/MAPFRE", kind: "archive", supports: "条目给出 MAPFRE 的早期全称" },
    confidence: "probable",
  },
  "x-es-chupa-chups": {
    story: "Chupa Chups 来自西班牙语动词 chupar，意思是“吸、吮”；名称直接对应棒棒糖的食用动作。",
    background: "用动作动词来命名零食，让名称本身像一句口语化的产品说明，也容易在广告中被反复唱念。",
    roots: [{ label: "chupar", language: "西班牙语", meaning: "吸、吮" }, { label: "Chupa Chups", language: "西班牙语品牌形式", meaning: "由动词构成的重复节奏" }],
    source: { title: "Chupa Chups", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Chupa_Chups", kind: "archive", supports: "条目说明名称来自西班牙语 chupar" },
    confidence: "probable",
  },
  "x-in-paytm": {
    story: "Paytm 是 Pay Through Mobile 的缩写，直白说明了它最初以手机完成支付的定位。",
    background: "名称把功能描述压缩为短字母串，既便于移动端展示，也让支付方式成为品牌身份的核心。",
    roots: [{ label: "Pay", language: "英语", meaning: "支付" }, { label: "Through Mobile", language: "英语", meaning: "通过手机" }],
    source: { title: "Paytm", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Paytm", kind: "archive", supports: "条目将 Paytm 释为 Pay Through Mobile 的缩写" },
    confidence: "probable",
  },
  "x-au-qantas": {
    story: "Qantas 是 Queensland And Northern Territory Aerial Services 的首字母缩写，保留了航空公司最初服务的两个澳大利亚地区与业务性质。",
    background: "字母缩写先是早期公司全称的简写，后来成为更便于记忆与全球传播的独立航空品牌。",
    roots: [{ label: "Queensland", language: "地名", meaning: "昆士兰" }, { label: "Northern Territory", language: "地名", meaning: "北领地" }, { label: "Aerial Services", language: "英语", meaning: "航空服务" }],
    source: { title: "Qantas", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Qantas", kind: "archive", supports: "条目说明 Qantas 是原始公司全称的首字母缩写" },
    confidence: "probable",
  },
  "x-fi-nokia": {
    story: "Nokia 取自芬兰的诺基亚镇及附近的 Nokianvirta 河；公司的早期工厂就位于这一地区。",
    background: "名称首先是地理来源标记，后来才随着造纸、橡胶、线缆与通信业务扩张成为全球科技品牌。",
    roots: [{ label: "Nokia", language: "芬兰地名", meaning: "公司早期工厂所在城镇" }, { label: "Nokianvirta", language: "芬兰语地名", meaning: "邻近河流" }],
    source: { title: "History of Nokia", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/History_of_Nokia", kind: "archive", supports: "条目说明 Nokia 名称源自城镇与邻近河流" },
    confidence: "probable",
  },
  "x-no-hurtigruten": {
    story: "Hurtigruten 原为挪威沿海航线的名称；两家航运公司合并后，新公司直接以这条航线命名。",
    background: "这里的品牌名并非抽象造词，而是把一项既有公共交通路线的名称转为企业名称。",
    roots: [{ label: "Hurtigruten", language: "挪威语航线名", meaning: "公司运营的沿海航线名称" }],
    source: { title: "Hurtigruten", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Hurtigruten", kind: "archive", supports: "条目说明合并后的公司以该航线命名" },
    confidence: "probable",
  },
  "x-id-kopiko": {
    story: "Kopiko 以夏威夷 kōpiko 咖啡豆命名；咖啡豆名称为糖果的咖啡风味提供了直接的原料联想。",
    background: "食品品牌借具体原料命名，使名称先传达味道与香气，再成为可跨市场使用的商品标识。",
    roots: [{ label: "kōpiko", language: "夏威夷语植物名", meaning: "一种咖啡豆" }, { label: "Kopiko", language: "品牌形式", meaning: "咖啡风味糖果品牌" }],
    source: { title: "Kopiko (brand)", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Kopiko_(brand)", kind: "archive", supports: "条目说明品牌以 kōpiko coffee bean 命名" },
    confidence: "probable",
  },
  "x-tr-migros-turkey": {
    story: "土耳其 Migros 沿用瑞士 Migros 的名称；该名称由法语 mi（“半、中间”）和 gros（“批发”）组成。",
    background: "土耳其业务最初由瑞士 Migros 共同创立，后来独立经营，但保留了原有的法语构词品牌。",
    roots: [{ label: "mi", language: "法语", meaning: "半、中间" }, { label: "gros", language: "法语", meaning: "批发" }],
    source: { title: "Migros", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Migros", kind: "archive", supports: "条目说明土耳其 Migros 由瑞士 Migros 共同创立，名称来自法语 mi 与 gros" },
    confidence: "probable",
  },
};

const priorityCountryCodes = new Set<CountryCode>(["DE", "FR", "KR", "US", "JP", "IT", "GB", "CN"]);

export const expandedEntries: Entry[] = catalogs.flatMap((catalog) => {
  const allItems = catalog.groups.flatMap(([category, groupedNames]) => names(groupedNames).map((name) => ({ name, category })));
  const items = priorityCountryCodes.has(catalog.code) ? allItems : allItems.slice(0, 10);
  return items.map(({ name, category }, index) => {
    const id = `x-${catalog.code.toLowerCase()}-${slug(name)}`;
    const audit = audits[id];
    const editorialOrigin = editorialOrigins[id];
    const generatedOrigin = generatedOrigins[id];
    const webCandidate = candidateSource(id);
    const pendingStory = `“${name}”的命名来源：未知。暂无可核验的一手资料。`;
    const pendingBackground = "暂无可直接支持命名动机的一手资料；本站不根据拼写、产品或品牌印象推断词源。";
    const related = [
      `x-${catalog.code.toLowerCase()}-${slug(items[(index + 1) % items.length].name)}`,
      `x-${catalog.code.toLowerCase()}-${slug(items[(index + 2) % items.length].name)}`,
    ];
    return {
      id,
      name,
      nativeName: name,
      zhName: name,
      aliases: [],
      countryCode: catalog.code,
      country: catalog.country,
      category,
      countryRank: index + (priorityCountryCodes.has(catalog.code) ? 11 : 1),
      founded: null,
      ipa: generatedOrigin?.ipa ?? "/暂无可核验音标/",
      reading: generatedOrigin?.reading ?? `待补官方读音：${name}`,
      story: editorialOrigin
        ? editorialOrigin.story
        : generatedOrigin?.story ?? pendingStory,
      background: editorialOrigin
        ? editorialOrigin.background
        : generatedOrigin?.background ?? pendingBackground,
      methods: editorialOrigin ? ["一手来源", "命名所指"] : generatedOrigin?.methods ?? ["待考证"],
      roots: editorialOrigin
        ? editorialOrigin.roots
        : generatedOrigin?.roots ?? [{ label: name, language: "品牌商号", meaning: "当前对外使用的名称形式" }, { label: "未知", language: "命名来源", meaning: "暂无可核验的命名资料" }],
      source: editorialOrigin?.source ?? {
        title: generatedOrigin ? "ChatGPT 辅助整理（待二次核验）" : webCandidate?.title ?? "Wikidata name-origin audit",
        publisher: generatedOrigin ? "ChatGPT" : webCandidate?.domain ?? "Wikimedia Foundation",
        url: generatedOrigin ? "https://chatgpt.com/" : webCandidate?.url ?? (audit ? `https://www.wikidata.org/wiki/${audit.id}` : `https://www.wikidata.org/w/index.php?search=${encodeURIComponent(name)}`),
        kind: "archive",
        supports: generatedOrigin?.evidence ?? "后续查证线索，未直接说明命名来源",
      },
      confidence: editorialOrigin?.confidence ?? generatedOrigin?.confidence ?? "pending",
      related,
    };
  });
});

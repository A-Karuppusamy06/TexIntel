// Sample textile market data
export const cottonPriceData = [
  { date: "Jan", price: 0.82, predicted: 0.84 },
  { date: "Feb", price: 0.85, predicted: 0.86 },
  { date: "Mar", price: 0.79, predicted: 0.81 },
  { date: "Apr", price: 0.88, predicted: 0.87 },
  { date: "May", price: 0.91, predicted: 0.90 },
  { date: "Jun", price: 0.87, predicted: 0.89 },
  { date: "Jul", price: 0.93, predicted: 0.92 },
  { date: "Aug", price: 0.89, predicted: 0.91 },
  { date: "Sep", price: 0.95, predicted: 0.94 },
  { date: "Oct", price: 0.92, predicted: 0.96 },
  { date: "Nov", price: 0.97, predicted: 0.98 },
  { date: "Dec", price: 0.94, predicted: 0.99 },
];

export const yarnPriceData = [
  { date: "Jan", price: 2.45, predicted: 2.48 },
  { date: "Feb", price: 2.52, predicted: 2.55 },
  { date: "Mar", price: 2.38, predicted: 2.42 },
  { date: "Apr", price: 2.61, predicted: 2.58 },
  { date: "May", price: 2.73, predicted: 2.70 },
  { date: "Jun", price: 2.58, predicted: 2.65 },
  { date: "Jul", price: 2.82, predicted: 2.78 },
  { date: "Aug", price: 2.69, predicted: 2.75 },
  { date: "Sep", price: 2.91, predicted: 2.88 },
  { date: "Oct", price: 2.78, predicted: 2.95 },
  { date: "Nov", price: 3.02, predicted: 3.05 },
  { date: "Dec", price: 2.89, predicted: 3.12 },
];

export const fabricPriceData = [
  { date: "Jan", price: 4.20, predicted: 4.25 },
  { date: "Feb", price: 4.35, predicted: 4.38 },
  { date: "Mar", price: 4.12, predicted: 4.18 },
  { date: "Apr", price: 4.48, predicted: 4.45 },
  { date: "May", price: 4.62, predicted: 4.58 },
  { date: "Jun", price: 4.38, predicted: 4.50 },
  { date: "Jul", price: 4.75, predicted: 4.70 },
  { date: "Aug", price: 4.55, predicted: 4.65 },
  { date: "Sep", price: 4.88, predicted: 4.82 },
  { date: "Oct", price: 4.68, predicted: 4.92 },
  { date: "Nov", price: 5.02, predicted: 5.08 },
  { date: "Dec", price: 4.82, predicted: 5.15 },
];

export const predictions = [
  {
    material: "Cotton (Raw)",
    currentPrice: 0.94,
    prediction7d: 0.96,
    prediction15d: 0.98,
    prediction30d: 1.02,
    confidence: 87,
  },
  {
    material: "Polyester Yarn",
    currentPrice: 2.89,
    prediction7d: 2.95,
    prediction15d: 3.02,
    prediction30d: 3.15,
    confidence: 82,
  },
  {
    material: "Cotton Fabric",
    currentPrice: 4.82,
    prediction7d: 4.90,
    prediction15d: 5.05,
    prediction30d: 5.22,
    confidence: 79,
  },
  {
    material: "Silk Thread",
    currentPrice: 12.45,
    prediction7d: 12.62,
    prediction15d: 12.88,
    prediction30d: 13.25,
    confidence: 74,
  },
];

export const marketNews = [
  {
    id: 1,
    title: "Global Cotton Prices Surge Amid Supply Chain Disruptions",
    summary: "Cotton futures reached a 10-year high as major producing regions face weather-related challenges and logistics bottlenecks continue to impact global trade.",
    source: "Textile World",
    date: "2 hours ago",
    category: "Cotton",
  },
  {
    id: 2,
    title: "Sustainable Textiles Market to Reach ₹150B by 2030",
    summary: "New market research indicates strong growth in eco-friendly textile demand, driven by consumer preferences and regulatory changes across major markets.",
    source: "Industry Insights",
    date: "5 hours ago",
    category: "Sustainability",
  },
  {
    id: 3,
    title: "Asian Yarn Manufacturers Report Record Q4 Production",
    summary: "Leading yarn producers in Southeast Asia announce expanded capacity and increased output to meet growing demand from European and American buyers.",
    source: "Asia Textile News",
    date: "1 day ago",
    category: "Yarn",
  },
  {
    id: 4,
    title: "New AI Technologies Transform Quality Control in Textile Mills",
    summary: "Advanced machine learning systems are being deployed across textile manufacturing facilities, reducing defect rates by up to 40% and improving efficiency.",
    source: "Tech in Textiles",
    date: "1 day ago",
    category: "Technology",
  },
  {
    id: 5,
    title: "European Fabric Importers Face New Tariff Regulations",
    summary: "Upcoming changes to trade policies will affect pricing and availability of imported fabrics, prompting buyers to reassess supply chain strategies.",
    source: "Trade Journal",
    date: "2 days ago",
    category: "Trade",
  },
  {
    id: 6,
    title: "Wool Prices Stabilize After Volatile Quarter",
    summary: "Australian wool futures show signs of stability following months of price fluctuations, providing relief to manufacturers and buyers alike.",
    source: "Wool Weekly",
    date: "3 days ago",
    category: "Wool",
  },
];

export const adminStats = {
  totalUsers: 2847,
  activeUsers: 1923,
  dataPointsProcessed: 12500000,
  predictionAccuracy: 86.4,
  apiCalls: 458290,
  lastUpdate: "2 minutes ago",
};

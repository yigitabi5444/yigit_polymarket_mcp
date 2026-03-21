export interface GammaMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  category: string;
  endDate: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  liquidity: string;
  volume: string;
  volume24hr: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  restricted: boolean;
  marketMakerAddress: string;
  outcomes: string;
  outcomePrices: string;
  clobTokenIds: string;
  bestBid: string;
  bestAsk: string;
  lastTradePrice: string;
  spread: string;
  description: string;
  tags?: GammaTag[];
  events?: GammaEvent[];
  [key: string]: unknown;
}

export interface GammaEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  liquidity: string;
  volume: string;
  markets?: GammaMarket[];
  tags?: GammaTag[];
  series?: GammaSeries;
  [key: string]: unknown;
}

export interface GammaTag {
  id: string;
  label: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface GammaSeries {
  id: string;
  title: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  events?: GammaEvent[];
  [key: string]: unknown;
}

export interface GammaSearchResult {
  events?: GammaEvent[];
  markets?: GammaMarket[];
  [key: string]: unknown;
}

export interface GammaSport {
  id: string;
  label: string;
  slug: string;
  [key: string]: unknown;
}

export interface GammaSportsTeam {
  id: string;
  name: string;
  slug: string;
  sport: string;
  [key: string]: unknown;
}

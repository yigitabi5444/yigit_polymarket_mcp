export interface ClobPrice {
  price: string;
  [key: string]: unknown;
}

export interface ClobMidpoint {
  mid: string;
  [key: string]: unknown;
}

export interface ClobLastTradePrice {
  price: string;
  [key: string]: unknown;
}

export interface OrderBookEntry {
  price: string;
  size: string;
}

export interface ClobOrderBook {
  market: string;
  asset_id: string;
  hash: string;
  timestamp: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  [key: string]: unknown;
}

export interface ClobOrderBookSummary {
  market: string;
  asset_id: string;
  bid: string;
  ask: string;
  spread: string;
  [key: string]: unknown;
}

export interface ClobMarket {
  condition_id: string;
  question_id: string;
  tokens: ClobToken[];
  rewards: ClobRewards;
  minimum_order_size: string;
  minimum_tick_size: string;
  description: string;
  category: string;
  end_date_iso: string;
  game_start_time: string;
  question: string;
  market_slug: string;
  min_incentive_size: string;
  max_incentive_spread: string;
  active: boolean;
  closed: boolean;
  seconds_delay: number;
  icon: string;
  fpmm: string;
  [key: string]: unknown;
}

export interface ClobToken {
  token_id: string;
  outcome: string;
  price: string;
  winner: boolean;
  [key: string]: unknown;
}

export interface ClobRewards {
  rates: ClobRewardRate[];
  min_size: string;
  max_spread: string;
  [key: string]: unknown;
}

export interface ClobRewardRate {
  asset_address: string;
  rewards_daily_rate: string;
  [key: string]: unknown;
}

export interface ClobTickSize {
  minimum_tick_size: string;
  [key: string]: unknown;
}

export interface ClobTrade {
  id: string;
  taker_order_id: string;
  market: string;
  asset_id: string;
  side: string;
  size: string;
  fee_rate_bps: string;
  price: string;
  status: string;
  match_time: string;
  [key: string]: unknown;
}

export interface DataTrade {
  proxyWallet: string;
  side: string;
  asset: string;
  conditionId: string;
  size: string;
  price: string;
  timestamp: string;
  title: string;
  slug: string;
  outcome: string;
  outcomeIndex: string;
  name: string;
  pseudonym: string;
  transactionHash: string;
  [key: string]: unknown;
}

export interface DataHolder {
  proxyWallet: string;
  name: string;
  pseudonym: string;
  amount: string;
  side: string;
  conditionId: string;
  title: string;
  slug: string;
  outcome: string;
  [key: string]: unknown;
}

export type Price = { decimals: number; price: number; symbol: string; timestamp: number; confidence: number };
export type Prices = { [address: string]: Price };

export interface Liq {
  owner: string;
  liqPrice: number;
  collateral: string;
  collateralAmount: string;
  extra?: {
    displayName?: string;
    url: string;
  };
}

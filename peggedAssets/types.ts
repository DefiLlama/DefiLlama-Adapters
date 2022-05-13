export interface TokenPrices {
  [token: string]: {
    usd: number;
  };
}

export type PeggedTokenBalance = {
  [assetIsPeggedTo: string]: number | null;
};

export type TokensValueLocked = {
  [tokenSymbolOrName: string]: number;
};

export type tvlsObject<T> = {
  [chain: string]: T;
};

export type PeggedAssetIssuance = {
  [chain: string]: {
      [issuanceType: string]: PeggedTokenBalance;
  };
};



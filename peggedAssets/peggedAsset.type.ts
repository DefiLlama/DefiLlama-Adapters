export type ChainBlocks = {
  [x: string]: number;
};

export type PeggedAssetType = "peggedUSD";
export type StringNumber = string;
export type Balances = {
  [peggedAsset in PeggedAssetType]: StringNumber | number;
};

export type Fetch = (
  timestamp: number,
  ethBlock: number,
  chainBlocks: ChainBlocks
) => Promise<Balances>;

export type PeggedIssuanceAdapter = {
  [chain: string]: {
    minted: Promise<Fetch> | (() => Promise<{}>);
    unreleased: Promise<Fetch> | (() => Promise<{}>);
    [bridgedFrom: string]: Promise<Fetch> | (() => Promise<{}>);
  };
};

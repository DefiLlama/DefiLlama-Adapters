export type ChainBlocks = {
  [x: string]: number;
};

export type FetchResult = {
  block?: number;
  dailyVolume?: string;
  totalVolume: string;
  timestamp: number;
};

export type Fetch = (
  timestamp: number,
  chainBlocks: ChainBlocks
) => Promise<FetchResult>;

export type VolumeAdapter = {
  [x: string]: {
    start: number | any;
    fetch: Fetch;
    runAtCurrTime?: boolean;
    customBackfill?: any;
  };
};

export type BreakdownAdapter = {
  [x: string]: VolumeAdapter;
};

export type DexVolumeAdapter = {
  volume: VolumeAdapter;
};

export type DexBreakdownAdapter = {
  breakdown: BreakdownAdapter;
};

export type DexAdapter = DexVolumeAdapter | DexBreakdownAdapter;

export type ChainBlocks = {
  [x: string]: number
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
  [chain: string]: {
    start: () => Promise<number>
    fetch: Fetch;
    runAtCurrTime?: boolean;
    customBackfill?: Fetch;
  };
};

export type BreakdownAdapter = {
  [version: string]: VolumeAdapter;
};

export type DexVolumeAdapter = {
  volume: VolumeAdapter;
};

export type DexBreakdownAdapter = {
  breakdown: BreakdownAdapter;
};

export type DexAdapter = DexVolumeAdapter | DexBreakdownAdapter;

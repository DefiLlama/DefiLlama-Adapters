import { Chain } from "@defillama/sdk/build/general";

export type ChainBlocks = {
  [x: string]: number
};

export type ChainEndpoints = {
  [chain: string]: string
}

export type FetchResult = {
  timestamp: number;
  dailyVolume?: string;
  totalVolume?: string;
  block?: number;
};

export type Fetch = (
  timestamp: number,
  chainBlocks: ChainBlocks
) => Promise<FetchResult>;

export type IStartTimestamp = () => Promise<number>

export type Adapter = {
  [chain: string]: {
    start: IStartTimestamp
    fetch: Fetch;
    runAtCurrTime?: boolean;
    customBackfill?: Fetch;
  }
};

export const DISABLED_ADAPTER_KEY = 'DISABLED_ADAPTER'

export type SimpleVolumeAdapter = {
  volume: Adapter
};

export type BreakdownAdapter = {
  [version: string]: Adapter
};

export type BreakdownVolumeAdapter = {
  breakdown: BreakdownAdapter;
};

export type VolumeAdapter = SimpleVolumeAdapter | BreakdownVolumeAdapter;

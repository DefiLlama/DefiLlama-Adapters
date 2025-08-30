// @ts-ignore
const { sumTokens2 } = require('../helper/solana');
// @ts-ignore
const { getConfig } = require('../helper/cache');

// Pacifica Exchange - Solana only
const PACIFICA_SOLANA_CONTRACT = '72R843XwZxqWhsJceARQQTTbYtWy6Zw9et2YV4FpRHTa';

// Pacifica API Endpoints (confirmed)
const PACIFICA_INFO_API = 'https://api.pacifica.fi/api/v1/info';
const PACIFICA_PRICES_API = 'https://api.pacifica.fi/api/v1/info/prices';

const OWNER_MAP: { [chain: string]: string } = {
  'solana': '72R843XwZxqWhsJceARQQTTbYtWy6Zw9et2YV4FpRHTa',
};

// TypeScript interfaces for API responses
interface PacificaMarketInfo {
  symbol: string;
  tick_size: string;
  min_tick: string;
  max_tick: string;
  lot_size: string;
  max_leverage: number;
  isolated_only: boolean;
  min_order_size: string;
  max_order_size: string;
  funding_rate: string;
  next_funding_rate: string;
}

interface PacificaPriceData {
  funding: string;
  mark: string;
  mid: string;
  next_funding: string;
  open_interest: string;
  oracle: string;
  symbol: string;
  timestamp: number;
  volume_24h: string;
  yesterday_price: string;
}

interface PacificaPricesApiResponse {
  success: boolean;
  data: PacificaPriceData[];
  error: string | null;
  code: string | null;
}

interface PacificaInfoApiResponse {
  success: boolean;
  data: PacificaMarketInfo[];
  error: string | null;
  code: string | null;
}

interface ApiContext {
  chain: string;
  chainId: number;
}

async function fetchTokenData(api: ApiContext): Promise<string[]> {
  // Pacifica is a perps exchange that only accepts USDC as collateral
  // USDC on Solana mint address
  return ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'];
}

async function fetchVolumeData(): Promise<PacificaPriceData[]> {
  try {
    const response: PacificaPricesApiResponse = await getConfig('pacifica/volume-data', PACIFICA_PRICES_API);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching Pacifica volume data:', error);
    return [];
  }
}

async function fetchMarketInfo(): Promise<PacificaMarketInfo[]> {
  try {
    const response: PacificaInfoApiResponse = await getConfig('pacifica/market-info', PACIFICA_INFO_API);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching Pacifica market info:', error);
    return [];
  }
}

// @ts-ignore
module.exports = {
  timetravel: false,
  hallmarks: [
    [Math.floor(new Date('2025-06-10').getTime() / 1000), 'Pacifica Exchange Launch']
  ],
  category: 'Derivatives' as const,
  website: 'https://pacifica.fi/',
  github: 'https://github.com/pacifica-fi',
  twitter: 'https://x.com/pacifica_fi',
  solana: {
    tvl: async (api: ApiContext) => {
      return sumTokens2({ owner: OWNER_MAP.solana, tokens: await fetchTokenData(api) });
    },
    volume: async (api: ApiContext) => {
      const volumeData = await fetchVolumeData();
      // Calculate total volume across all trading pairs using volume_24h from API
      const totalVolume = volumeData.reduce((sum: number, pair: PacificaPriceData) => {
        return sum + (parseFloat(pair.volume_24h) || 0);
      }, 0);
      return totalVolume;
    }
  },
  methodology: 'USDC collateral deposited into Pacifica Exchange for perpetual futures trading. Volume data fetched from Pacifica API.'
};

// In Arbitrum
const RootPort = "0x5399Eee5073bC1018233796a291Ffd6a78E26cbb";

/**
 * UI supported chains list
 */
const CHAINS = [
  "ethereum",
  "optimism",
  "base",
  "polygon",
  "bsc",
  "avax",
  "metis",
];

/**
 * Holds the layerzero chain ids to chain for the UI supported chains
 */
const EVM_CHAIN_ID_FROM_LZ_CHAIN_ID = {
  101: "ethereum",
  111: "optimism",
  184: "base",
  137: "polygon",
  102: "bsc",
  106: "avax",
  151: "metis",
};

const chainToLZChainID = {
  "ethereum": "101",
  "optimism": "111",
  "base": "184",
  "polygon": "137",
  "bsc": "102",
  "avax": "106",
  "metis": "151",
};

const nativeTokenPerChain = {
  "0xec32aAd0e8fc6851f4bA024B33dE09607190Ce9b": {
    underlyingAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    chain: "ethereum",
  },
  "0xab57C3f001A749B340686E6DB3532792A76D7715": {
    underlyingAddress: "0x4200000000000000000000000000000000000006",
    chain: "optimism",
  },
  "0xa168bE53a546163f36210f3c440fbDC41BE99EE2": {
    underlyingAddress: "0x4200000000000000000000000000000000000006",
    chain: "base",
  },
  "0xabF1b68bD9d4672235AdD840F5C46544785f3fac": {
    underlyingAddress: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    chain: "polygon",
  },
  "0xa98b83e9529A5a49780ad07fbC6DA48101f41c17": {
    underlyingAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    chain: "bsc",
  },
  "0x53f671e1a31f803Dcf8070F70D60C17a4FBf3c72": {
    underlyingAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    chain: "avax",
  },
  "0x9E60eB63Eaad46759A170B9eE5cC27E5Dd68C7e1": {
    underlyingAddress: "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
    chain: "metis",
  },
};

exports.config = {
  RootPort,
  CHAINS,
  EVM_CHAIN_ID_FROM_LZ_CHAIN_ID,
  chainToLZChainID,
  nativeTokenPerChain,
};

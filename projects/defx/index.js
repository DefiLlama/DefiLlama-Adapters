const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const { sumTokens2 } = require("../helper/solana");

// DefX contract addresses for each chain
const DEFX_CONTRACTS = {
  arbitrum: '0x091486F9427cf07942fa17Ad7194BE3feaDfa46d',
  ethereum: '0xeaeF42356f5893e1043B38b050d6ED6a0231e8B0',
  base: '0x1C0eaa2e6D6a959D510Bb7f4E9D112A66cdAB8E1',
  polygon: '0x1C0eaa2e6D6a959D510Bb7f4E9D112A66cdAB8E1',
  bsc: '0x73E9f16a6c7b9B838f94d9aB87d623cf35C7f133',
  solana: '5fr8JvWwjBPFJcSoUMMAZqKWk7zk6fCC43aWD8RukJH6'
}


const CHAIN_CONFIGS = {
  ethereum: {
    tokens: [
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDe,
      ADDRESSES.ethereum.sUSDe,
      ADDRESSES.ethereum.STETH,
      ADDRESSES.ethereum.cbBTC,
      ADDRESSES.ethereum.LBTC,
      ADDRESSES.ethereum.POL,
      ADDRESSES.ethereum.BUSD,
    ],
    contract: DEFX_CONTRACTS.ethereum
  },
  arbitrum: {
    tokens: [
      ADDRESSES.arbitrum.WETH,
      ADDRESSES.arbitrum.WBTC,
      ADDRESSES.arbitrum.USDT,
      ADDRESSES.arbitrum.USDC,
      ADDRESSES.arbitrum.USDC_CIRCLE,
      ADDRESSES.arbitrum.USDe,
      ADDRESSES.arbitrum.sUSDe,
    ],
    contract: DEFX_CONTRACTS.arbitrum
  },
  base: {
    tokens: [
      ADDRESSES.base.USDC,
      ADDRESSES.base.WETH,
      ADDRESSES.base.USDT,
      ADDRESSES.base.cbBTC,
    ],
    contract: DEFX_CONTRACTS.base
  },
  polygon: {
    tokens: [
      ADDRESSES.polygon.USDC,
      ADDRESSES.polygon.USDC_CIRCLE,
      ADDRESSES.polygon.USDT,
      ADDRESSES.polygon.WETH,
      ADDRESSES.polygon.WBTC,
      ADDRESSES.polygon.WMATIC,
    ],
    contract: DEFX_CONTRACTS.polygon
  },
  bsc: {
    tokens: [
      ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.USDT,
      ADDRESSES.bsc.WBNB,
      ADDRESSES.bsc.BTCB,
      ADDRESSES.bsc.BUSD,
      ADDRESSES.bsc.ETH
    ],
    contract: DEFX_CONTRACTS.bsc
  },
  solana: {
    tokens: [
      ADDRESSES.solana.USDC,
      ADDRESSES.solana.SOL,
      ADDRESSES.solana.USDT
    ],
    contract: DEFX_CONTRACTS.solana
  }
   
}

// Create TVL function for each EVM chain
function createEvmTvl(chain) {
  const config = CHAIN_CONFIGS[chain];
  if (!config) return null;
  
  return sumTokensExport({ 
    tokensAndOwners: config.tokens.map(token => [token, config.contract])
  });
}

function createSolanaTvl(chain) {
  const config = CHAIN_CONFIGS[chain];
  if (!config) return null;

  return async (api) => {
    return sumTokens2({ 
      api,
      tokensAndOwners: config.tokens.map(token => [token, config.contract])
    });
  };
}

module.exports = {
  methodology: "DefX TVL is calculated by summing the value of all supported tokens locked in DefX contracts.",
  
  // EVM chains
  ethereum: {
    tvl: createEvmTvl('ethereum')
  },
  arbitrum: {
    tvl: createEvmTvl('arbitrum')
  },
  base: {
    tvl: createEvmTvl('base')
  },
  polygon: {
    tvl: createEvmTvl('polygon')
  },
  bsc: {
    tvl: createEvmTvl('bsc')
  },
  solana: {
    tvl: createSolanaTvl('solana')
  }
}
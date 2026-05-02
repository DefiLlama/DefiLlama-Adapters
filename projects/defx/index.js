const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const { sumTokens2 } = require("../helper/solana");

// DefX contract addresses for each chain
const DEFX_CONTRACTS = {
  arbitrum: [
      '0x091486F9427cf07942fa17Ad7194BE3feaDfa46d', '0x3Ef2AdEf2bd4cD18508dd3b65e5f56dcaDDe7098',
      '0x0C4f7B4FAdC6441A44EDF12a585e0917033d8EDc', '0x5fE3acFCd55485164c9A4cBe7d4eeAD02ea7b1A0',
      '0xbDef0A65e4B587D8A6a9fcEcac6667341E5C6423'
  ],
  ethereum: [
      '0xeaeF42356f5893e1043B38b050d6ED6a0231e8B0', '0xC2CDa1d04C6dB887E4241A01B41B8f321ad67B92',
      '0x5522a4339A8722Ba4471d93f3851ccf55a7d3d2D', '0x96155d1782d058a22CEa896728e9Be98b5e787C7',
      '0x21789748f00A880b169c2f811Ab6A81617eE655a', '0xFA80F2C261c879C1e769aCeA49c60961CC26EB48',
      '0xbc2d9A3a69F7E5779eDc4961e6d9fbc134A4A277', '0x4Df086293B83fBB3610AcB65432026c7909aaA84',
      '0x4e74E5d499aBF76d6E76B9515b535d69D97B8dcC', '0xB6964F0F3504c06f96aA350cD98CEE4000713e44',
      '0x2B3e68CEAEFf28B05473990148B70212131294cF', '0x6E261DD742C663BfF54225f6aF92Ac995893BADD',
      '0xf51322155813a2b4Ecb613ad38D7803560548d6a', '0x1C01bCd98A94332F83CAC9A66Af3c49b5547737B',
      '0x69abCbEa31e31A03D978714791F31Fc20e0d1C88', '0xe2D5A8e7ad0B3C19D3b5e93326cbF6013aeAF805',
      '0x4828fE771cC82f48c644B62af1A8DA3Fd7e0B9af', '0x3Ef2AdEf2bd4cD18508dd3b65e5f56dcaDDe7098',
      '0x0C4f7B4FAdC6441A44EDF12a585e0917033d8EDc', '0x5fE3acFCd55485164c9A4cBe7d4eeAD02ea7b1A0',
      '0xbDef0A65e4B587D8A6a9fcEcac6667341E5C6423',
  ],
  base: ['0x1C0eaa2e6D6a959D510Bb7f4E9D112A66cdAB8E1'],
  polygon: ['0x1C0eaa2e6D6a959D510Bb7f4E9D112A66cdAB8E1', '0x96155d1782d058a22CEa896728e9Be98b5e787C7', '0x1C01bCd98A94332F83CAC9A66Af3c49b5547737B'],
  bsc: ['0x73E9f16a6c7b9B838f94d9aB87d623cf35C7f133'],
  solana: ['5fr8JvWwjBPFJcSoUMMAZqKWk7zk6fCC43aWD8RukJH6']
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
      ADDRESSES.polygon.aPolWMATIC
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
    tokensAndOwners: config.tokens.flatMap(token =>
        config.contract.map(owner => [token, owner])
    )
  });
}

function createSolanaTvl(chain) {
  const config = CHAIN_CONFIGS[chain];
  if (!config) return null;

  return async (api) => {
    return sumTokens2({ 
      api,
      tokensAndOwners: config.tokens.flatMap(token =>
          config.contract.map(owner => [token, owner])
      )
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
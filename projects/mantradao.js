const { sumTokens2 } = require('./helper/unwrapLPs')
const { pool2 } = require("./helper/pool2");

const CONTRACTS = {
  ethereum: {
    STAKING: [
      '0x1eA973A69643091410721C7D91aA5499CF8D2Cb7', // MANTRA Finance
      '0x04493F715B08DeA8af77814d600bEf22f1f0C63B', // Sherpa Stake
      '0xA01892D97e9C8290C2C225FB0b756BFE26bc9802', // MANTRA DAO Pool #2
    ],
    POOL2: [
      { pair: '0xe46935ae80e05cdebd4a4008b6ccaa36d2845370', contract: '0x91fe14df53eae3a87e310ec6edcdd2d775e1a23f' } // OM-WETH LP staking
    ],
    TOKEN: '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d'
  },

  bsc: {
    STAKING: [
      '0x41A32C610FA23dEa9E85D471CAD66ea828853153', // MANTRA Finance
      '0xEf2663d96e48a543D9EA96A39869aB54f7F5D872', // Sherpa Stake
      '0xEfc2d65302eb6345A7C0e212B791e0d45C2C3c91'  // MANTRA DAO
    ],
    POOL2: [
      { pair: '0x49837a48abde7c525bdc86d9acba39f739cbe22c', contract: '0xcbf42ace1dbd895ffdcabc1b841488542626014d' } // OM-WETH LP staking
    ],

    TOKEN: '0xF78D2e7936F5Fe18308A3B2951A93b6c4a41F5e2',
  },

  polygon: {
    STAKING: [
      '0xD77F495Ce60cd9414F99670bEc8657A021e34C83', // MANTRA Finance
      '0x427756E0BBb792f24018E670D570b1b147DbF1F8', // Sherpa Stake
      '0xCdD0f77A2A158B0C7cFe38d00443E9A4731d6ea6' // MANTRA DAO
    ],
    POOL2: [
      { pair: '0xff2bbcb399ad50bbd06debadd47d290933ae1038', contract: '0xCBf42Ace1dBD895FFDCaBC1b841488542626014d' } // OM-WETH LP staking
    ],

    TOKEN: '0xC3Ec80343D2bae2F8E680FDADDe7C17E71E114ea',
  }
};

const blacklistedTokens = []
const blacklistedLPs = [];

// https://docs.llama.fi/list-your-project/what-to-include-as-tvl
function getChainTVL(chain) {
  return {
    tvl: async (api) => sumTokens2({
      token: CONTRACTS[chain].TOKEN,
      owners: CONTRACTS[chain].STAKING,
      blacklistedTokens,
      blacklistedLPs,
      api
    })
  };
}

// Staking - the platform's own tokens
function getChainStaked(chain) {
  return {
    staking: async (api) => sumTokens2({
      token: CONTRACTS[chain].TOKEN,
      owners: CONTRACTS[chain].STAKING,
      blacklistedTokens,
      blacklistedLPs,
      api
    })
  };
}

// Pool2 - staked LP tokens where one side of the market is the platform's own governance token.
function getChainPool2s(chain) {
  if (!CONTRACTS[chain].POOL2) return { pool2: async () => ({}) };
  return {
    pool2: pool2(CONTRACTS[chain].POOL2.map(p => p.contract), CONTRACTS[chain].POOL2.map(p => p.pair), chain)
  };
}

Object.keys(CONTRACTS).forEach(chain => {
  module.exports[chain] = {
    ...getChainTVL(chain),
    ...getChainStaked(chain),
    //...getChainPool2s(chain), - Disabled for now
  }
}) 

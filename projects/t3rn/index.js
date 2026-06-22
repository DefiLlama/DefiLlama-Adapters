const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const CONFIG = {
  ethereum: {
    remoteOrder: [
      '0x86EB4faF1574B6Ad8dCF685907a60a5b89f27276',
    ],
    tokens: [
      ADDRESSES.GAS_TOKEN_2,
      ADDRESSES.ethereum.USDC,
    ]
  },
  bsc: {
    remoteOrder: [
      '0x81D3E0341a3C7806B77433B7b339Ac6dCcaDA683'
    ],
    tokens: [
      ADDRESSES.GAS_TOKEN_2,
      ADDRESSES.bsc.USDC,
    ]
  },
  arbitrum: {
    remoteOrder: [
      '0x3F305740E3f7650cA3EaD2597fEB785fa07d621F',
    ],
    tokens: [
      ADDRESSES.GAS_TOKEN_2,
      ADDRESSES.arbitrum.USDC,
    ]
  },
  optimism: {
    remoteOrder: [
      '0xbf0C855e8A93930432D21dF08b3C534895650f7f',
    ],
    tokens: [
      ADDRESSES.GAS_TOKEN_2,
      ADDRESSES.optimism.USDC,
    ]
  },
  linea: {
    remoteOrder: [
      '0xE441B664929a374Ea23fD72A617b66377A1c33D4',
    ],
    tokens: [
      ADDRESSES.GAS_TOKEN_2,
      ADDRESSES.linea.USDC,
    ]
  },
  base: {
    remoteOrder: [
      '0xF1D550eA864a29c277602fdA2683E48ff52614eC',
    ],
    tokens: [
      ADDRESSES.GAS_TOKEN_2,
      ADDRESSES.base.USDC,
    ]
  },
  unichain: {
    remoteOrder: [
      '0x7f99f7d79F04884cee4A86a3aB76Dca8B0e15491',
    ],
    tokens: [
      ADDRESSES.GAS_TOKEN_2,
      ADDRESSES.unichain.USDC,
    ]
  },
}

// TRN token address on Arbitrum
const TRN_ARBITRUM = '0x1114982539A2Bfb84e8B9e4e320bbC04532a9e44'

// Staking contracts on Arbitrum
const ARBITRUM_STAKING = [
  '0xC5a87664DCFD45B1bF646cFD209c5a54118B146B', // stakedTRNChef
  '0x536e9D7328276BAaE13Df7028dCF8d37bBa2F2Cd', // govAdapter
  '0x8B09F3B41203ec18Ec2E80eEc1bd57A91f21DB7D', // syrupBar
]

module.exports = {
    hallmarks:[
  ],
  methodology:
    "t3rn TVL is the USD value of token balances in the bridge contracts and TRN tokens staked on Arbitrum.",
}

Object.keys(CONFIG).forEach(chain => module.exports[chain] = {
  tvl: async (api) => {
    const { remoteOrder, tokens, } = CONFIG[chain]
    return sumTokens2({ api, owners: remoteOrder, tokens });
  }
})

// Add staking as a separate function for Arbitrum
module.exports.arbitrum.staking = async (api) => {
  // Get TRN balances from staking contracts
  const balances = await sumTokens2({ 
    api, 
    owners: ARBITRUM_STAKING, 
    tokens: [TRN_ARBITRUM]
  });
  
  // Transform the arbitrum TRN address to coingecko ID for proper pricing
  const arbTrnKey = `arbitrum:${TRN_ARBITRUM.toLowerCase()}`;
  if (balances[arbTrnKey]) {
    // Convert from wei to token amount (divide by 10^18) for coingecko pricing
    balances['coingecko:t3rn'] = balances[arbTrnKey] / 1e18;
    delete balances[arbTrnKey];
  }
  
  return balances;
}

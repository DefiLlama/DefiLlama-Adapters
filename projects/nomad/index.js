const ADDRESSES = require('../helper/coreAssets.json')
// proxy contract:
//     https://github.com/nomad-xyz/config/blob/main/production.json
// token holdings:
//     https://etherscan.io/tokenholdings?a=PUT CONTRACT ADDRESS HERE

const { sumTokens } = require('../helper/unwrapLPs')
const { chainExports } = require("../helper/exports");

const HOME_CHAINS = {
  'ethereum': '0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3', 
  'moonbeam': '0xD3dfD3eDe74E0DCEBC1AA685e151332857efCe2d', 
  'milkomeda': '0x9faF7f27c46ACdeCEe58Eb4B0Ab6489E603EC251',
  'evmos': '0x2eff94f8c56c20f85d45e9752bfec3c0522c55c7'
};

const TOKEN_ADDRESSES = [
  {
    'ethereum': ADDRESSES.ethereum.FRAX
  },
  {
    'ethereum': ADDRESSES.ethereum.USDC
  },
  {
    'ethereum': ADDRESSES.ethereum.DAI
  },
  {
    'ethereum': ADDRESSES.ethereum.USDT
  },
  {
    // FXS
    'ethereum': '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0'
  },
  {
    'ethereum': ADDRESSES.ethereum.WETH
  },
  {
    'ethereum': ADDRESSES.ethereum.WBTC
  },
  {
    // IAG
    'ethereum': '0x40EB746DEE876aC1E78697b7Ca85142D178A1Fc8'
  },
  {
    // CQT
    'ethereum': '0xD417144312DbF50465b1C641d016962017Ef6240'
  },
  {
    // C3
    'ethereum': '0xf1a91C7d44768070F711c68f33A7CA25c8D30268'
  },
  {
    // GERO
    'ethereum': '0x3431F91b3a388115F00C5Ba9FdB899851D005Fb5'
  },
  {
    // CARDS
    'ethereum': '0x3d6F0DEa3AC3C607B3998e6Ce14b6350721752d9'
  },
  {
    // renBTC
    'ethereum': '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D'
  },
  {
    // sBTC
    'ethereum': '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6'
  },
  {
    // HBTC
    'ethereum': '0x0316EB71485b0Ab14103307bf65a021042c6d380'
  }
];

function tvl(chain) {
  return async (time, _, { [chain]: block }) => {
    const toa = []
    const owner = HOME_CHAINS[chain]
    TOKEN_ADDRESSES.forEach(t => {
      if (t[chain]) toa.push([t[chain], owner])
    })
    return sumTokens({}, toa, block, chain)
  }
}

module.exports = {
  hallmarks: [
    [1659312000,"trusted root exploit"]
  ],
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the total amount of assets locked in the Nomad token bridge.',
  start: 13983843,
  ...chainExports(tvl, Object.keys(HOME_CHAINS))
}; 

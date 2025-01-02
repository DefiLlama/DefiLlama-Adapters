const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, sumTokensExport, } = require('../helper/unwrapLPs');

const OCEAN_CONTRACT = '0xC32eB36f886F638fffD836DF44C124074cFe3584';
const DAI_CONTRACT = ADDRESSES.optimism.DAI;
const USDC_CONTRACT = ADDRESSES.arbitrum.USDC;
const USDT_CONTRACT = ADDRESSES.arbitrum.USDT;
const WBTC_CONTRACT = ADDRESSES.arbitrum.WBTC;
const WSTETH_CONTRACT = ADDRESSES.arbitrum.WSTETH;
const ARB_CONTRACT = ADDRESSES.arbitrum.ARB;

const TOKEN_CONTRACTS = [
  DAI_CONTRACT,
  USDC_CONTRACT,
  USDT_CONTRACT,
  WBTC_CONTRACT,
  WSTETH_CONTRACT,
  ARB_CONTRACT,
  nullAddress,
]

module.exports = {
  methodology: 'Sums up the value of all tokens wrapped into Shell v2',
  arbitrum: {
    tvl: sumTokensExport({ owner: OCEAN_CONTRACT, tokens: TOKEN_CONTRACTS})
  },
  hallmarks: [
    [1662927378, "Shell v2 Launch"]
  ]
}; 
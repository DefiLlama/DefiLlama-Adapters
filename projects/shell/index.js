const { nullAddress, sumTokensExport, } = require('../helper/unwrapLPs');

const OCEAN_CONTRACT = '0xC32eB36f886F638fffD836DF44C124074cFe3584';
const DAI_CONTRACT = '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1';
const USDC_CONTRACT = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8';
const USDT_CONTRACT = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
const WBTC_CONTRACT = '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f';
const WSTETH_CONTRACT = '0x5979D7b546E38E414F7E9822514be443A4800529';
const ARB_CONTRACT = '0x912ce59144191c1204e64559fe8253a0e49e6548';

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
  start: 24142587,
  arbitrum: {
    tvl: sumTokensExport({ owner: OCEAN_CONTRACT, tokens: TOKEN_CONTRACTS})
  },
  hallmarks: [
    [1662927378, "Shell v2 Launch"]
  ]
}; 
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require('../helper/unwrapLPs');

const TOKEN_CONTRACTS = [
  ADDRESSES.pulse.DAI,
  ADDRESSES.pulse.USDC,
  ADDRESSES.pulse.USDT,
]

module.exports = {
  pulse: {
    tvl: sumTokensExport({ owner: '0x35C49cB4fa16C557968cF43e237674b38bf05327', tokens: TOKEN_CONTRACTS})
  },
}; 
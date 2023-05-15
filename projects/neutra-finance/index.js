const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  const vaults = ['0x2a958665bc9a1680135241133569c7014230cb21']
  const tokens = await api.multiCall({ abi: 'address:token', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
  api.addTokens(tokens, bals)
  return sumTokens2({
    api,
    owners: ['0x6bfa4f1dfafeb9c37e4e8d436e1d0c5973e47e25'],
    tokens: ['0x1addd80e6039594ee970e5872d247bf0414c8903', '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',],
  })
}
module.exports = {
  arbitrum: {
    tvl,
  }
};
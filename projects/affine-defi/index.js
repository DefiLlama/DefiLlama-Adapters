const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  const vaults = ['0x829363736a5A9080e05549Db6d1271f070a7e224']
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
  api.addTokens(tokens, bals)
  const ownerTokens = [
    [['0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6'], '0x1F9b1057cd93fb2d07d18810903B791b56acc2E1']
  ]
  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  doublecounted: true,
  polygon: { tvl }
}
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

async function ethTvl(_, _b, _cb, { api, }) {
  const ethBaskets = [
    '0x61A18EE9d6d51F838c7e50dFD750629Fd141E944', '0x78Bb94Feab383ccEd39766a7d6CF31dED177Ad0c', '0x72D51B2233c5feA8a702FDd0E51B0adE95638f2c'
  ]
  for(const basket of ethBaskets) {
    const vaults = [basket]
    const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
    const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
    api.addTokens(tokens, bals)
  }
  return sumTokens2({ api })
}

module.exports = {
  doublecounted: true,
  timetravel: true,
  methodology: 'Counts the tokens in the Affine baskets',
  polygon: { tvl },
  ethereum: { tvl: ethTvl }
}

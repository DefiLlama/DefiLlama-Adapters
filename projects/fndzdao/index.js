const { staking } = require('../helper/staking')
const { getConfig } = require('../helper/cache')
const getTrackedAssetsAbi = "address[]:getTrackedAssets"

async function tvl(api) {
  const res = await getConfig('fndzdao', 'https://api.fndz.io/tvl')
  const vaults = res.result.chains[0].vault_addresses;
  const tokens  = await api.multiCall({  abi: getTrackedAssetsAbi, calls: vaults })
  const ownerTokens = vaults.map((v, i) => [tokens[i], v])
  return api.sumTokens({ ownerTokens, })
}

module.exports = {
  bsc: {
    tvl,
    staking: staking('0x4910638b88c40Ee382CEd72A4056E2f859Bd4658', '0x7754c0584372d29510c019136220f91e25a8f706')
  },
};
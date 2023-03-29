const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')
const { get } = require('../helper/http')
const { getConfig } = require('../helper/cache')
const sdk = require('@defillama/sdk')
const chain = 'bsc'
const getTrackedAssetsAbi = "address[]:getTrackedAssets"

async function tvl(_, _b, {[chain]: block }) {
  const res = await getConfig('fndzdao', 'https://api.fndz.io/tvl')
  const vaults = res.result.chains[0].vault_addresses;
  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: getTrackedAssetsAbi,
    calls: vaults.map(i => ({ target: i})),
    chain, block,
  })
  const toa = tokens.map(({ input: { target }, output}) => output.map(i => ([i, target]))).flat()
  return sumTokens2({ chain, block, tokensAndOwners: toa, })
}

module.exports = {
  timetravel: false,
  bsc: {
    tvl,
    staking: staking('0x4910638b88c40Ee382CEd72A4056E2f859Bd4658', '0x7754c0584372d29510c019136220f91e25a8f706', chain)
  },
};
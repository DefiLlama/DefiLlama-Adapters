const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getParamCalls } = require('../helper/utils')
const { yieldHelper } = require('../helper/yieldHelper')

const cubFarmAddress = '0x227e79c83065edb8b954848c46ca50b96cb33e16';
const cubKingdomFarmAddress = '0x2E72f4B196b9E5B89C29579cC135756a00E6CBBd';
const cub = '0x50d809c74e0b8e49e7b4c65bb3109abe3ff4c1c1'

const chain = 'bsc'

async function tvl(timestamp, ethBlock, { bsc: block }) {
  const toa = []
  const poolLength = (await sdk.api.abi.call({
    target: cubFarmAddress,
    abi: abi['poolLength'],
    chain, block,
  })).output;
  const { output: res } = await sdk.api.abi.multiCall({
    target: cubFarmAddress,
    abi: abi['poolInfo'],
    calls: getParamCalls(poolLength),
    chain, block,
  })

  res.forEach(({ output }) => toa.push([output.lpToken, cubFarmAddress]))
  return sumTokens2({ chain, block, tokensAndOwners: toa, blacklistedTokens: [cub, '0x5E719AA339a6229692cf4163Eb0D966ACF93Ce28',], resolveLP: true, })
}

const kingdomTvl = yieldHelper({
  project: 'cub-finance',
  chain: 'bsc',
  masterchef: cubKingdomFarmAddress,
  nativeToken: cub,
})

module.exports = { ...kingdomTvl }

module.exports.bsc.tvl = sdk.util.sumChainTvls([kingdomTvl.bsc.tvl, tvl])
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const { sumTokens2 } = require('../helper/unwrapLPs')
const { yieldHelper } = require('../helper/yieldHelper')

const cubFarmAddress = '0x227e79c83065edb8b954848c46ca50b96cb33e16';
const cubKingdomFarmAddress = '0x2E72f4B196b9E5B89C29579cC135756a00E6CBBd';
const cub = '0x50d809c74e0b8e49e7b4c65bb3109abe3ff4c1c1'

async function tvl(api) {
  const farms = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: cubFarmAddress})
  return sumTokens2({ api, owner: cubFarmAddress, tokens: farms.map(i => i.lpToken), blacklistedTokens: [cub, '0x5E719AA339a6229692cf4163Eb0D966ACF93Ce28',], resolveLP: true, })
}

const kingdomTvl = yieldHelper({
  project: 'cub-finance',
  chain: 'bsc',
  masterchef: cubKingdomFarmAddress,
  nativeToken: cub,
})

module.exports = { ...kingdomTvl }

module.exports.bsc.tvl = sdk.util.sumChainTvls([kingdomTvl.bsc.tvl, tvl])
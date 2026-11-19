const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');
const { getCoreAssets } = require('../helper/tokenMapping');

const owners = ['0x25c9C4B56E820e0DEA438b145284F02D9Ca9Bd52']
const badPools = ['0x4200000000000000000000000000000000000006-0xb7508a35da6d89af3c26841cbdf1efa0e12899f1-10000'.toLowerCase()]

const tvl = async (api) => {
  const uniV3WhitelistedTokens = getCoreAssets(api.chain)
  await sumTokens2({ api, owners, resolveUniV3: true, uniV3WhitelistedTokens, uniV3ExtraConfig: { blacklistedPools: badPools } })
  return api.getBalancesV2().clone(2).getBalances()
}

const chains = ['ethereum', 'bsc', 'arbitrum', 'base']

module.exports  = {
  misrepresentedTokens: true,
  methodology: "Tracks the total value of assets locked in GoPlus Locker V3 contracts across multiple chains"
}

chains.forEach((chain) => {
  module.exports[(chain)] = { tvl }
})
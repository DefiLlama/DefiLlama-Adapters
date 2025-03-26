const abi = require("./abi.json");
const { sumTokens2 } = require("../helper/unwrapLPs")
const { getConfig } = require("../helper/cache");
const { nullAddress } = require("../helper/tokenMapping");

async function getProcolAddresses(api) {
  const chain = api.chain
  let key = chain
  if (chain === 'fantom') key = 'ftm'
  return (await getConfig('kalmy-app/' + chain,
    `https://raw.githubusercontent.com/kalmar-io/kalmar-assets/main/data/${key}-kalmar-contract.json`
  ))
}

async function tvl(api) {
  const addresses = await getProcolAddresses(api)

  if (api.chain === 'bsc') {
    const calls = []
    const tokens = []

    const tokensAndOwners = addresses['Liquidity'].map((v) => [v['stakingToken'], v['stakingTokenAt']])

    for (let i = 0; i < addresses['Vaults'].length; i++) {
      calls.push(...addresses['Vaults'][i]['workers'].map((worker) => {
        return {
          target: worker['stakingTokenAt'],
          params: [worker['pId'], worker['address']]
        }
      }))
      tokens.push(...addresses['Vaults'][i]['workers'].map((worker) => worker['stakingToken']))
    }
    const bals = await api.multiCall({ abi: abi.userInfo, calls })
    api.add(tokens, bals.map(i => i.amount))
    const vaultTokensAndOwners = addresses['Vaults'].map((v) => [v['baseToken'], v['address']])
    tokensAndOwners.push(...vaultTokensAndOwners)
    const vBNB = addresses['Vaults'].filter((v) => v['symbol'] === 'iBNB')[0]
    if (vBNB) tokensAndOwners.push([nullAddress, vBNB])
  }
  return sumTokens2({ api, resolveLP: true, })
}


async function staking(api) {
  const addresses = await getProcolAddresses(api)
  const tokensAndOwners = addresses['Staking'].map((s) => [s['stakingToken'], s['address']])
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  bsc: { tvl, staking, },
  fantom: { tvl, staking, },
  avax: { tvl, staking, },
}
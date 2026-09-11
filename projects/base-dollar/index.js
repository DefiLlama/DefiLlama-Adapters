const { getLiquityV2Tvl } = require('../helper/liquity')
const { sumTokens2 } = require('../helper/unwrapLPs')

const collateralRegistry = '0x7551ebfc8340b7f91874942be9c653733d4fb04f'

async function tvl(api) {
  await getLiquityV2Tvl(collateralRegistry)(api)
  const stable = await api.call({ abi: 'address:boldToken', target: collateralRegistry })
  await sumTokens2({ api, resolveLP: true }) // some collaterals are aero LP tokens
  api.removeTokenBalance(stable)  // remove own stablecoin from tvl
  return api.getBalances()
}

module.exports = {
  base: { tvl },
}

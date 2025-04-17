
const { getVaultTvl, fortyAcresMapping, baseTokenMapping, veNftMapping } = require("./helpers");
const { unwrapSolidlyVeNft } = require('../helper/unwrapLPs');


async function getLockedVeNFTBalance(api) {
  await unwrapSolidlyVeNft({ api, baseToken: baseTokenMapping[api.chain], veNft: veNftMapping[api.chain], owner: fortyAcresMapping[api.chain] })
  await api.sumTokens({ owner: fortyAcresMapping[api.chain], tokens: [baseTokenMapping[api.chain]] },)
}


async function tvl(api) {
  await getLockedVeNFTBalance(api, fortyAcresMapping[api.chain]);
  await getVaultTvl(api)
  return api.getBalances()
}




module.exports = {
  timetravel: true,
  start: '2025-01-31',
  methodology: `TVL includes the locked veNFTs and the USDC deposits in the vault`,
  base: { tvl: tvl },
  optimism: { tvl: tvl },
}

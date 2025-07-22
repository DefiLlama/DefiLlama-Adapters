const { getTokenPrices } = require('../helper/unknownTokens')
const sdk = require("@defillama/sdk"); 
const { staking } = require('../helper/staking')

const token = '0x9bedce29f79076b21dd04958a9fd4b22f63fd86d'

async function frbVault(api) {
  const balances = {
    ['avax:'+token]: await api.call({ abi: 'uint256:balanceVault', target: token, })
  }
  const { updateBalances } = await getTokenPrices({ ...api, useDefaultCoreAssets: true, lps: ['0xa862ff4a1d2393818dbdbfbeb33bf5e35e9156f0'], allLps: true, })
  updateBalances(balances)
  return balances
}

const stakedFRB = staking("0xcc2F243FA7bBcab3BD951E8aE40730173af88b83", "0x9BedCE29F79076b21DD04958a9Fd4B22F63fD86D")

module.exports = {
  misrepresentedTokens: true,
  avax: {
    tvl: () => 0,
    staking: sdk.util.sumChainTvls([frbVault,stakedFRB])
  }
};

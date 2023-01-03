const { getTokenPrices } = require('../helper/unknownTokens')

const token = '0x9bedce29f79076b21dd04958a9fd4b22f63fd86d'

async function staking(_, _b, _cb, { api, }) {
  const balances = {
    ['avax:'+token]: await api.call({ abi: 'uint256:balanceVault', target: token, })
  }
  const { updateBalances } = await getTokenPrices({ ...api, useDefaultCoreAssets: true, lps: ['0xa862ff4a1d2393818dbdbfbeb33bf5e35e9156f0'], allLps: true, })
  updateBalances(balances)
  return balances
}

module.exports = {
  misrepresentedTokens: true,
  avax: {
    tvl: () => 0,
    staking,
  }
};

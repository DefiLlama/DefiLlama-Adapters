const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

// FTM locked in the gateway is priced as native S from this date
const swapDate = '2025-11-01'
const bridge = '0xa1E2481a9CD0Cb0447EeB1cbc26F1b3fff3bec20'

async function tvl(api) {
  if (api.timestamp < new Date(swapDate) / 1e3) {
    return sumTokens2({
      api,
      owner: bridge,
      fetchCoValentTokens: true,
    })
  }

  return sumTokens2({
    api,
    owner: bridge,
    blacklistedTokens: [ADDRESSES.ethereum.FTM],
    fetchCoValentTokens: true,
  })
}

async function staking(api) {
  if (api.timestamp < new Date(swapDate) / 1e3) return
  const ftmBalance = await api.call({ abi: 'erc20:balanceOf', target: ADDRESSES.ethereum.FTM, params: bridge })
  api.add('sonic:' + ADDRESSES.null, ftmBalance, { skipChain: true })
}

module.exports = {
  methodology: "Counts assets escrowed in the Sonic Gateway TokenDeposit on Ethereum. From 2025-11-01, the gateway's FTM balance is priced as native S, Sonic's own token, and counted under staking.",
  ethereum: {
    tvl,
    staking,
  },
};

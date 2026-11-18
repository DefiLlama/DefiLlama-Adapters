const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

// FTM locked in the gateway is priced as native S from this date
const swapDate = '2025-11-01'
const bridge = '0xa1E2481a9CD0Cb0447EeB1cbc26F1b3fff3bec20'

async function tvl(api) {
  return sumTokens2({
    api,
    owner: bridge,
    blacklistedTokens: [ADDRESSES.ethereum.FTM],
    fetchCoValentTokens: true,
  })
}

async function staking(api) {
  const ftmBalance = await api.call({ abi: 'erc20:balanceOf', target: ADDRESSES.ethereum.FTM, params: bridge })
  if (api.timestamp < new Date(swapDate) / 1e3) api.add(ADDRESSES.ethereum.FTM, ftmBalance)
  else api.add('sonic:' + ADDRESSES.null, ftmBalance, { skipChain: true })
}

module.exports = {
  methodology: "Counts assets escrowed in the Sonic Gateway TokenDeposit on Ethereum. The gateway's FTM is Sonic's own token and is counted under staking, priced as native S from 2025-11-01.",
  ethereum: {
    tvl,
    staking,
  },
};

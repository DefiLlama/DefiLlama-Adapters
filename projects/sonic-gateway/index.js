const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const swapDate = '2025-11-01'
      const bridge = '0xa1E2481a9CD0Cb0447EeB1cbc26F1b3fff3bec20'

      // we convert ftm tokens to sonic after the swap date
      if (api.timestamp < new Date(swapDate) / 1e3) {
        return sumTokens2({
          api,
          owner: bridge,
          fetchCoValentTokens: true,
        })
      }

      await sumTokens2({
        api,
        owner: bridge,
        blacklistedTokens: [ADDRESSES.ethereum.FTM],
        fetchCoValentTokens: true,
      })

      const ftmBalance = await api.call({ abi: 'erc20:balanceOf', target: ADDRESSES.ethereum.FTM, params: bridge })
      api.add('sonic:' + ADDRESSES.null, ftmBalance, { skipChain: true })
    },
  },
};

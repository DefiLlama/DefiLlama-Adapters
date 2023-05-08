const { default: BigNumber } = require('bignumber.js');
const sdk = require("@defillama/sdk");
const { fetchURL } = require("../helper/utils");
const { transformBalances } = require("../helper/portedTokens");

module.exports = {
  polygon_zkevm: {
    staking: async () => {
      const {output: stakingBalance} = await sdk.api.abi.call({
        abi: 'erc20:totalSupply',
        target: "0xdd38211f2973dc41cd6fC4DB681596Fd6118D894",
        chain: 'polygon_zkevm'
      });
      const { price : mangoPrice } = (await fetchURL('https://prod.clober-api.com/1101/markets/0x1FC38BA10E741F357b1c8B69DC08eA654c21Ae37/trades?limit=1')).data.trades[0]
      const balances = {}
      sdk.util.sumSingleBalance(balances, "0x1fA03eDB1B8839a5319A7D2c1Ae6AAE492342bAD", BigNumber(stakingBalance).times(mangoPrice).div(1e18).toFixed(0))
      return transformBalances('polygon_zkevm', balances)
    },
    tvl: () => ({})
  }
};

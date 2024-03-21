const { sumTokens2 } = require("../helper/unwrapLPs");
const STAKING_LP_USDC_DOLA = "0x33ff52D1c4b6973CD5AF41ad53Dd92D99D31D3c3";
const LP_USDC_DOLA = "0xB720FBC32d60BB6dcc955Be86b98D8fD3c4bA645";

async function tvl(api) {
  const lpBal = await api.call({ abi: 'erc20:balanceOf', target: '0xa1034ed2c9eb616d6f7f318614316e64682e7923', params: STAKING_LP_USDC_DOLA})
  api.add(LP_USDC_DOLA, lpBal)
  return sumTokens2({ api, resolveLP: true, })
}

module.exports = {
  methodology: "Calculate TVL of staking lp product",
  optimism: {
    tvl,
  },
};

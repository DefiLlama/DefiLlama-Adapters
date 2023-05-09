const sdk = require("@defillama/sdk");
const { gmxExports } = require("../helper/gmx");

const SGLP_TOKEN = "0x5402B5F40310bDED796c7D0F3FF6683f5C0cFfdf";
const BLUEBERRY_GLP_COMPOUNDER_CONTRACT =
  "0x5BAC5eEfA13696Cf815388021235b215587263Ea";

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const glpBalances = await api.call({
    abi: "erc20:balanceOf",
    target: SGLP_TOKEN,
    params: [BLUEBERRY_GLP_COMPOUNDER_CONTRACT],
  });

  await sdk.util.sumSingleBalance(balances, SGLP_TOKEN, glpBalances, api.chain);

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Total assets in Seashell's Blueberry GLP Compounder contract",
  start: 66190371,
  arbitrum: {
    tvl,
  },
};

const BigNumber = require("bignumber.js");
const { get } = require("../helper/http");

module.exports = {
  methodology: `TVL data is pulled from the our canister`,
  misrepresentedTokens: true,
  bitcoin: { tvl },
};

async function tvl(api) {
  const runes = await get("https://7rvjr-3qaaa-aaaar-qaeyq-cai.raw.icp0.io/locked_runes");

  // source code: https://github.com/octopus-network/api.omnity.network/blob/main/src/app/api/price/tokens/route.ts
  const prices = await get("https://api.omnity.network/api/price/tokens")

  const tvl = runes.reduce(
    (
      acc,
      rune
    ) => {
      const amount = new BigNumber(rune.amount).div(10 ** rune.decimals)
      return acc.plus(amount.times(prices[rune.token_id] ?? 0))
    },
    new BigNumber(0)
  )
  return api.addUSDValue(tvl.toNumber())
}


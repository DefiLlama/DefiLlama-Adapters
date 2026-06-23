const { fetchURL } = require("../helper/utils");

// lending info: https://app.increment.fi/markets
async function borrowed(api) {
  const { data: tvls } = await fetchURL("https://app.increment.fi/info/tvl");
  return api.addUSDValue(Math.round(tvls.LendingBorrow))
}

const tvl = async (api) => {
  const { data: tvls } = await fetchURL("https://app.increment.fi/info/tvl")
  return api.addUSDValue(Math.round(tvls.LendingTVL - tvls.LendingBorrow))
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Counting the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed funds are not counted in the TVL, so only the tokens actually locked in the contracts are counted.",
  flow: { tvl, borrowed },
};

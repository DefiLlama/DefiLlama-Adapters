const { fetchURL } = require("../helper/utils");

// increment lending info: https://app.increment.fi/markets
async function tvl() {
  const { data: tvls } = await fetchURL("https://app.increment.fi/info/tvl");
  return tvls.LendingTVL - tvls.LendingBorrow;
}
async function fetch() {
  const { data: tvls } = await fetchURL("https://app.increment.fi/info/tvl");
  return tvls.LendingTVL - tvls.LendingBorrow;
}
//denominating in tether as a placeholder for usd
async function borrowed() {
  const { data: tvls } = await fetchURL("https://app.increment.fi/info/tvl");
  return {tether: tvls.LendingBorrow};
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Counting the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed funds are not counted in the TVL, so only the tokens actually locked in the contracts are counted.",
  flow: {
    fetch: tvl,
    borrowed: borrowed
  },
  fetch
};

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

async function borrowed() {
  const { data: tvls } = await fetchURL("https://app.increment.fi/info/tvl");
  return tvls.LendingBorrow;
}

module.exports = {
  methodology:
    "This is the first lending protocol on the flow blockchain , and temporarily uses the project's own endpoint.",
  flow: {
    fetch: tvl
  },
  fetch
};

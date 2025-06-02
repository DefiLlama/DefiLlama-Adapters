const { get } = require("../helper/http");

async function tvl() {
  const data = await get(
    "https://api.forthewin.network/mainnet/tokens/liquidity/TOTAL/1"
  );
  return {
    tether: data.data[0]
  };
}

module.exports = {
  hallmarks: [],
  methodology: `TVL is obtained by making calls to the Forthewin Network API.`,
  misrepresentedTokens: true,
  timetravel: false,
  neo: {
    tvl
  }
};

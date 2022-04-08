const sdk = require("@defillama/sdk");

const crvPool = "0x20955CB69Ae1515962177D164dfC9522feef567E";
const uad = "0x0F644658510c95CB46955e55D7BA9DDa9E9fBEc6";
const tricrv = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";

async function tvl(timestamp, block) {
  let balances = {};
  let poolBalances = (
    await sdk.api.abi.multiCall({
      calls: [
        {
          target: uad,
          params: crvPool,
        },
        {
          target: tricrv,
          params: crvPool,
        },
      ],
      abi: "erc20:balanceOf",
      block,
    })
  ).output;
  poolBalances.forEach((p) => {
    let token = p.input.target;
    if (token === "0x0F644658510c95CB46955e55D7BA9DDa9E9fBEc6") {
      token = "0x6b175474e89094c44da98b954eedeac495271d0f";
    }
    sdk.util.sumSingleBalance(balances, token, p.output);
  });
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Tokens locked in the Curve Metapool",
  ethereum: {
    tvl,
  },
  tvl,
};

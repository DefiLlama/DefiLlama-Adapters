const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require("@defillama/sdk");

async function tvl(timestamp, _, { theta: block }) {
  return {
    "theta-fuel": (
      await sdk.api.eth.getBalance({
        target: ADDRESSES.theta.WTFUEL,
        block,
        chain: "theta",
        decimals: 18,
      })
    ).output,
  };
}

module.exports = {
  theta: {
    tvl,
  },
};

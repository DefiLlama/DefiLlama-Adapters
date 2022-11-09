const sdk = require("@defillama/sdk");

async function tvl(timestamp, _, { theta: block }) {
  return {
    "theta-fuel": (
      await sdk.api.eth.getBalance({
        target: "0x4dc08b15ea0e10b96c41aec22fab934ba15c983e",
        block,
        chain: "theta",
        decimals: 18,
      })
    ).output,
  };
};

module.exports = {
  theta: {
    tvl,
  },
};

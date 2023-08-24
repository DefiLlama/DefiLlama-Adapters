const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const shuttleIds = [2, 3, 4];
const FACTORY_CONTRACT = "0x94faE55669327e71E9EC579067ad6C3C3b84e574";

async function tvl(_, _1, _2, { api }) {
  let balances = {};

  for (let shuttleId of shuttleIds) {
    let shuttleTvlUsd = (
      await sdk.api.abi.multiCall({
        abi: abi.shuttleTvlUsd,
        calls: [
          {
            target: FACTORY_CONTRACT,
            params: shuttleId,
          },
        ],
        chain: "polygon",
      })
    ).output[0].output;

    sdk.util.sumSingleBalance(
      balances,
      "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      shuttleTvlUsd,
      "polygon"
    );
  }

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "TVL of all shuttles (borrowable + collateral).",
  polygon: {
    tvl,
  },
};

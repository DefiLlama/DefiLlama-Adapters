const sdk = require("@defillama/sdk");
const shuttleIds = [2, 3, 4];
const FACTORY_CONTRACT = "0x94faE55669327e71E9EC579067ad6C3C3b84e574";

async function tvl(_, _1, _2, { api }) {
  let balances = {};

  for (let shuttleId of shuttleIds) {
    let shuttleTvlUsd = (
      await sdk.api.abi.multiCall({
        abi: "function shuttleTvlUsd(uint256 shuttleId) public view override returns (uint256 totalUsd)",
        calls: [
          {
            target: FACTORY_CONTRACT,
            params: shuttleId,
          },
        ],
        chain: "polygon",
      })
    ).output[0].output;

    sdk.util.sumSingleBalance(balances, "polygon", shuttleTvlUsd);
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

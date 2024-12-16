const ADDRESSES = require("../helper/coreAssets.json");
const liquidStakingContract = "0xe5da20f15420ad15de0fa650600afc998bbe3955";

async function tvl(api) {
  const supply = await api.call({
    abi: "uint256:totalAssets",
    target: liquidStakingContract,
  });
  api.add(ADDRESSES.null, supply);
}

module.exports = {
  methodology: "Retrieve the total underlying S supply",
  sonic: {
    tvl,
  },
};

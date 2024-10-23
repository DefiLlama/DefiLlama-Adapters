const ADDRESSES = require("../helper/coreAssets.json");
const liquidStakingContract = "0xB458BfC855ab504a8a327720FcEF98886065529b";

async function tvl(api) {
  const supply = await api.call({
    abi: "uint256:totalFTMWorth",
    target: liquidStakingContract,
  });
  api.add(ADDRESSES.null, supply);
}

module.exports = {
  methodology: "Retrieve the total underlying FTM supply",
  fantom: {
    tvl,
  },
};

const ADDRESSES = require("../helper/coreAssets.json");

const THE_LINE_CONTRACT = "0xFaB50E438f7bf8953B1f66c47462035095C0a1E6";
const USDT_ARBITRUM = ADDRESSES.arbitrum.USDT; // 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9

async function tvl(api) {
  const rewardPool = await api.call({
    abi: "uint256:rewardPool",
    target: THE_LINE_CONTRACT,
  });
  api.add(USDT_ARBITRUM, rewardPool);
}

module.exports = {
  methodology:
    "TVL is the reward pool held in the THE LINE smart contract. The reward pool accumulates from promote, reserve, and buyout fees and is distributed to epoch winners.",
  arbitrum: {
    tvl,
  },
};

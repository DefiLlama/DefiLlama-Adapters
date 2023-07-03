const sdk = require("@defillama/sdk");
const abi = require("./staking.json");

const STAKING_CONTRACT = "0xee710f79aa85099e200be4d40cdf1bfb2b467a01";
const ARPA = "0xBA50933C268F567BDC86E1aC131BE072C6B0b71a";

const staking = async () => {
  const { output } = await sdk.api.abi.call({
    chain: "ethereum",
    target: STAKING_CONTRACT,
    abi: abi.find(({ name }) => name === "getTotalCommunityStakedAmount"),
  });

  return {
    [ARPA]: output,
  };
};

module.exports = {
  methodology: "TVL is the total amount of ARPA staked by the community",
  ethereum: {
    tvl: () => ({}),
    staking,
  },
};

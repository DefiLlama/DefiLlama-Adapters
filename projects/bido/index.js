const ADDRESSES = require("../helper/coreAssets.json");

const bidoStakeContract = "0x26bda683F874e7AE3e3A5d3fad44Bcb82a7c107C";

async function btc(api) {
  const pooledBTC = await api.call({
    target: bidoStakeContract,
    abi: "uint256:totalSupply",
  });

  return {
    [`ethereum:${ADDRESSES.ethereum.WBTC}`]: (pooledBTC / 1e18) * 1e8,
  };
}

module.exports = {
  bevm: {
    tvl: btc,
  },
};

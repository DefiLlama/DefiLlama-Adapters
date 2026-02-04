const aceContract = "0xec46d5a0ee47e585fab59a15976d0f2413bfbb82";

async function ace(api) {
  const pooledACE = await api.call({ target: aceContract, abi: "uint256:getTotalPooledAce", })
  api.addCGToken('endurance', pooledACE / 1e18)
}

module.exports = {
  methodology:
    "Staked tokens are counted as TVL based on the chain that they are staked on and where the liquidity tokens are issued.",
  ace: {
    tvl: ace,
  },
};

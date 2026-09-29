const APX_STAKING = "0x00b6792ac02caf607d0b6ea4a6f572a83472412f";
const APX_TOKEN   = "0x42523E3e454B97ff8651926685aFAD61C950Ab2F";

async function staking(api) {
  const [contractBalance, rewardsPool] = await Promise.all([
    api.call({ abi: "erc20:balanceOf", target: APX_TOKEN, params: [APX_STAKING] }),
    api.call({ abi: "uint256:rewardsPool", target: APX_STAKING }),
  ]);

  const contractBalanceBigInt = BigInt(contractBalance);
  const rewardsPoolBigInt = BigInt(rewardsPool);
  if (rewardsPoolBigInt > contractBalanceBigInt) {
    throw new Error("rewardsPool exceeds staking contract balance");
  }

  api.add(APX_TOKEN, contractBalanceBigInt - rewardsPoolBigInt);
}

module.exports = {
  methodology:
    "Tracks APX tokens deposited by users in the USDAX Finance APXStaking contract on " +
    "Robinhood Chain. TVL is derived as the contract's total APX balance minus the " +
    "protocol-owned reward pool, capturing both actively staking positions and amounts " +
    "currently in the 7-day cooldown window. Protocol reward reserves are excluded.",
  robinhood: { 
    tvl: () => ({}),
    staking
  },
};
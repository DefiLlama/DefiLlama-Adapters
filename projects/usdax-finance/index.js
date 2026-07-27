// USDAX Finance — APX Staking TVL Adapter
// Chain: Robinhood Chain Mainnet (chainId 4663)
// Contract: APXStaking at 0x00b6792ac02caf607d0b6ea4a6f572a83472412f
//
// TVL accounting:
//   The APXStaking contract holds three categories of APX:
//     1. totalStaked    — actively staking, accruing rewards
//     2. cooldownAmount — per-user amounts in the 7-day cooldown window (not accruing, but locked)
//     3. rewardsPool    — protocol-owned emission reserve (not user deposits)
//
//   TVL = (1) + (2) — all user-deposited APX regardless of accrual state.
//   Derived as: balanceOf(contract) - rewardsPool
//   This avoids enumerating per-user cooldown amounts and never relies on
//   totalStaked() which excludes cooldown positions by design.
//
//   Neither balanceOf nor rewardsPool can revert (ERC-20 standard + public
//   storage getter), so no error suppression is needed. Unexpected failures
//   propagate so DeFiLlama retains the last known-good TVL.

const APX_STAKING = "0x00b6792ac02caf607d0b6ea4a6f572a83472412f";
const APX_TOKEN   = "0x42523E3e454B97ff8651926685aFAD61C950Ab2F";

async function tvl(api) {
  const [contractBalance, rewardsPool] = await Promise.all([
    api.call({
      abi:    "erc20:balanceOf",
      target: APX_TOKEN,
      params: [APX_STAKING],
    }),
    api.call({
      abi:    "uint256:rewardsPool",
      target: APX_STAKING,
    }),
  ]);

  // User-deposited APX = total contract balance minus protocol reward reserve.
  // Covers both active stake and cooldown-locked positions.
  const userAPX = BigInt(contractBalance) - BigInt(rewardsPool);
  if (userAPX > 0n) {
    api.add(APX_TOKEN, userAPX.toString());
  }
}

module.exports = {
  methodology:
    "Tracks APX tokens deposited by users in the USDAX Finance APXStaking contract " +
    "on Robinhood Chain Mainnet (chain ID 4663). TVL is derived as the contract's total " +
    "APX balance minus the protocol-owned reward pool, capturing both actively staking " +
    "positions and amounts currently in the 7-day cooldown window. " +
    "Protocol reward reserves are excluded.",
  robinhoodchain: {
    tvl,
    staking: tvl,
  },
};

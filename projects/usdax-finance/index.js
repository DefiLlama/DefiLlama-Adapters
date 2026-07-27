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
//   We want (1) + (2) — all user-deposited APX regardless of accrual state.
//   Rather than enumerating per-user cooldown amounts, we derive it as:
//     userDeposited = balanceOf(contract) - rewardsPool
//
//   This approach is also resilient to the case where totalStaked = 0 (pool
//   not yet funded / no stakers), which caused the previous adapter to revert.

const APX_STAKING = "0x00b6792ac02caf607d0b6ea4a6f572a83472412f";
const APX_TOKEN   = "0x42523E3e454B97ff8651926685aFAD61C950Ab2F";

async function tvl(api) {
  try {
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

    // user-deposited APX = total contract balance minus protocol reward reserve
    const userAPX = BigInt(contractBalance) - BigInt(rewardsPool);
    if (userAPX > 0n) {
      api.add(APX_TOKEN, userAPX.toString());
    }
  } catch (_) {
    // Contract not yet funded or no stakers — report 0, do not throw
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

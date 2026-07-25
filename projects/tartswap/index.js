// TartSwap — DefiLlama adapter
// Submit as: projects/tartswap/index.js in a fork of github.com/DefiLlama/DefiLlama-Adapters
//
// Contracts (BSC mainnet, verified on-chain 2026-07-26):
//   TartStakingVault  0x20940d3573F1629F6c5226C2DDa2e9a28b364B33  (~$71k, 169 stakers)
//   CREPE token       0xeb2B7d5691878627eff20492cA7c9a71228d931D  (9 decimals)
//
// Methodology note: the vault stakes CREPE — TartSwap's ecosystem token — so per
// DefiLlama policy it belongs under `staking`, not headline TVL. LP farms exist
// but currently stream no rewards and hold ~no deposits; add a pool2/tvl section
// when they actually hold value. DEX pair liquidity lives on PancakeSwap pairs
// and is deliberately NOT claimed as TartSwap TVL.

const { staking } = require("../helper/staking");

const TART_STAKING_VAULT = "0x20940d3573F1629F6c5226C2DDa2e9a28b364B33";
const CREPE = "0xeb2B7d5691878627eff20492cA7c9a71228d931D";

module.exports = {
  methodology:
    "Staking counts CREPE deposited in the TartStakingVault contract (single-token, reward-streaming vault funded by protocol swap fees). DEX pair liquidity is not double-counted as TartSwap TVL.",
  bsc: {
    tvl: async () => ({}),
    staking: staking(TART_STAKING_VAULT, CREPE),
  },
};

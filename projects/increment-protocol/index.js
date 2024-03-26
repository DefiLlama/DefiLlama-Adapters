const VAULT_CONTRACT = "0x703500cAF3c79aF68BB3dc85A6846d1C7999C672";
const USDC_CONTRACT = "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4";

async function tvl(_, _1, _2, { api }) {
  const tvlInUSD = await api.call({
    abi: "int256:getTotalValueLocked",
    target: VAULT_CONTRACT
  });
  api.add(USDC_CONTRACT, tvlInUSD / 10 ** 12);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Counting the value of all tokens locked in the contracts to be used as collateral to trade or provide liquidity.",
  era: {
    tvl
  },
  start: 1710004200 // 2024-03-09 09:10
};

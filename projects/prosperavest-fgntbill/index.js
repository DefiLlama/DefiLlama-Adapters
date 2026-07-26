const ENSC = "0xF50FFf154E63E510e494929E9eab1E9C5047429E";

const TREASURY_MANAGER = {
  lisk: "0xCEAE041EF1002E8Ba508FD3e657016420E5da88a",
  base: "0xb48EF45E1bB7895332BcC23426093378cCB051fc",
};

const abi = {
  getTbillTVL: "function getTbillTVL() view returns (uint256)",
};

async function tvl(api) {
  const locked = await api.call({
    target: TREASURY_MANAGER[api.chain],
    abi: abi.getTbillTVL,
  });
  api.add(ENSC, locked);
}

module.exports = {
  methodology:
    "Sums the ENSC deposited into each ProsperaVest FGNTBILL vault. Vaults are enumerated on-chain via the Treasury Manager aggregator, which totals the ENSC held by every ENSC-backed vault. ENSC is priced by DefiLlama's price service.",
  timetravel: false,
  lisk: { tvl },
  base: { tvl },
};
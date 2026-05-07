const LITVAULT = "0x24b653b62533427E0b70e92c0e3a3E4D15597e64";
const ZKLTC = "0xc252c356DeA3ccf3cbC0632810563117C628751E";

async function tvl(api) {
  const balance = await api.call({
    abi: 'function totalAssets() view returns (uint256)',
    target: LITVAULT,
  });
  api.add(ZKLTC, balance);
}

module.exports = {
  liteforge: { tvl },
  methodology:
    "TVL is the total zkLTC deposited into the LitVault contract on LiteForge Testnet.",
};

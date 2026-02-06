
const sdk = require('@defillama/sdk');

const vaults = [
  {
    vault: "0xd735DD1499C5e5F30633f6B25Cc170d3D15d90Ad",  // WBERA_IBGT vault
    lpToken: "0x564f011d557aad1ca09bfc956eb8a17c35d490e0",
  },
  {
    vault: "0x4EcDe8C0b9A0c30CDd78C35A245F4afEDEF43d65",  // WBERA_LBGT vault
    lpToken: "0x705Fc16BA5A1EB67051934F2Fb17EacaE660F6c7",
  },
  {
    vault: "0xa62bf96CbC8508cEd7056c12258a0e12cC113c7c",  // HONEY_BYUSD vault
    lpToken: "0xde04c469ad658163e2a5e860a03a86b52f6fa8c8",
  },
];


const vaultAbi = "function totalAssets() view returns (uint256)";

async function tvl(api) {
  const totalAssets = await api.multiCall({
    abi: vaultAbi,
    calls: vaults.map(v => ({ target: v.vault })),
  });

  totalAssets.forEach((amount, i) => {
    api.add(vaults[i].lpToken, amount);
  });
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  start: 1751923200,  // July 1, 2025 (putted random here)
  hallmarks: [[1751932800, "Launch of Raga Finance"]],
  methodology: "TVL is calculated from LP tokens",
  berachain: {
    tvl,
  },
};

const USDbC = "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca";
const FACTORY = "0x649b80892ef773bd64cc3c663950dea3a604f660";
const VAULTS = [
  "0x3ace8180D2Bae36Fe4a9a2B9272Bf1F5453F5eF4",
  "0xECF1ce16589C4F0A352fAa2830c8A085AA9018CF",
  "0x263743b1c9Eb8fc9556e7A8f2b18df5DEfbb5147",
  "0x8e2D00E8dEE99753671c617F6Fa5241617eB4fbB",
]

async function tvl(_, _1, _2, { api }) {
  for (var vault of VAULTS) {
    const vaultBalance = await api.call({
      abi: "erc20:balanceOf",
      target: USDbC,
      params: [vault],
    });
    api.add(USDbC, vaultBalance);
  }
}

module.exports = {
  timetravel: false,
  base: {
    tvl,
  },
}

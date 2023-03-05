const sdk = require("@defillama/sdk");
const contracts = {
  cvxCRVLegacyHolder: "0x83507cc8c8b67ed48badd1f59f684d5d02884c81",
  cvxCRVHolder: "0x4ebad8dbd4edbd74db0278714fbd67ebc76b89b7",
  cvxFXSHolder: "0xf964b0e3ffdea659c44a5a52bc0b82a24b89ce0e",
  pxCvxHolder: "0x8659fc767cad6005de79af65dafe4249c57927af",
  auraBalHolder: "0x8c4eb0fc6805ee7337ac126f89a807271a88dd67",
  pxCvx: "0xBCe0Cf87F513102F22232436CCa2ca49e815C3aC",
};

const vaults = [
  contracts.cvxCRVLegacyHolder,
  contracts.cvxCRVHolder,
  contracts.auraBalHolder,
  contracts.cvxFXSHolder,
]

async function tvl(time, block, _, { api },) {
  const balances = {};

  const bals = await api.multiCall({ abi: "uint256:totalUnderlying", calls: vaults })
  const tokens = await api.multiCall({ abi: 'address:underlying', calls: vaults })
  bals.forEach((v, i) => sdk.util.sumSingleBalance(balances, tokens[i], v, api.chain))
  sdk.util.sumSingleBalance(balances, contracts.pxCvx, await api.call({ target: contracts.pxCvxHolder, abi: "uint256:totalAssets", }), api.chain)

  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
};

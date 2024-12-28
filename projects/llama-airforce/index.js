const sdk = require("@defillama/sdk");
const contracts = {
  uCRV1: "0x83507cc8c8b67ed48badd1f59f684d5d02884c81",
  uCRV2: "0x4ebad8dbd4edbd74db0278714fbd67ebc76b89b7",
  uCRV3: "0xde2bef0a01845257b4aef2a2eaa48f6eaeafa8b7",
  uFXS1: "0xf964b0e3ffdea659c44a5a52bc0b82a24b89ce0e",
  uFXS2: "0x3a886455e5b33300a31c5e77bac01e76c0c7b29c",
  uPRISMA: "0x9bfd08d7b3cc40129132a17b4d5b9ea3351464bd",
  uCVX: "0x8659fc767cad6005de79af65dafe4249c57927af",
  uBAL: "0x8c4eb0fc6805ee7337ac126f89a807271a88dd67",
  pxCvx: "0xBCe0Cf87F513102F22232436CCa2ca49e815C3aC",
};

const vaults = [
  contracts.uCRV1,
  contracts.uCRV2,
  contracts.uCRV3,
  contracts.uBAL,
  contracts.uFXS1,
  contracts.uFXS2,
  contracts.uPRISMA,
]

async function tvl(api,) {
  const balances = {};

  const bals = await api.multiCall({ abi: "uint256:totalUnderlying", calls: vaults })
  const tokens = await api.multiCall({ abi: 'address:underlying', calls: vaults })
  bals.forEach((v, i) => sdk.util.sumSingleBalance(balances, tokens[i], v, api.chain))
  sdk.util.sumSingleBalance(balances, contracts.pxCvx, await api.call({ target: contracts.uCVX, abi: "uint256:totalAssets", }), api.chain)

  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
};

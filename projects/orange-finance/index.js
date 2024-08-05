const VAULTS_V2 = [
  "0xe1B68841E764Cc31be1Eb1e59d156a4ED1217c2C",
  "0x5f6D5a7e8eccA2A53C6322a96e9a48907A8284e0",
  "0x22dd31a495CafB229131A16C54a8e5b2f43C1162",
  "0x708790D732c5886D56b0cBBEd7b60ABF47848FaA",
  "0x01E371c500C49beA2fa985334f46A8Dc906253Ea",
  "0xE32132282D181967960928b77236B3c472d5f396",
  "0x3D2692Bb38686d0Fb9B1FAa2A3e2e5620EF112A9",
];

const VAULTS_V1 = [
  "0xd6ecEb3978bf2b76958b96E8A207246b98C7d639",
  "0x59671Aa8F4E5adCcb26f4c88F0d6047B0ae7620b",
  "0x0B48540e214bc196e1D0954834876691fE19068D",
]

async function tvl(api) {
  const totalAssetsV1 = await api.multiCall({ abi: "uint256:totalAssets", calls: VAULTS_V2 })
  const tokensV1 = await api.multiCall({ abi: "address:asset", calls: VAULTS_V2 })
  totalAssetsV1.forEach((i, idx) => api.add(tokensV1[idx], i))

  const totalAssetsV2 = await api.multiCall({ abi: "uint256:totalAssets", calls: VAULTS_V1 })
  const tokensV2 = await api.multiCall({ abi: "address:token0", calls: VAULTS_V1 })
  totalAssetsV2.forEach((i, idx) => api.add(tokensV2[idx], i))
}

module.exports = {
  doublecounted: true,
  start: 154577707,
  arbitrum: {
    tvl,
  },
  hallmarks: [
    [1682680200, "Orange Alpha Vault Launch"], //2023 Apr 28
    [1688385600, "Camelot Vault Launch"], //2023 Jul 3
  ],
};

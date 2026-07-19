const ADDRESSES = require("../helper/coreAssets.json");

const ARBITRUM_VAULTS = [
  { address: "0x8b20087Bb0580bCB827d3ebDF06485aF86ea16cB", asset: ADDRESSES.arbitrum.WETH },
  { address: "0xa3899444a955Fb1DdDbd7Aea385771DB0a67fB12", asset: ADDRESSES.arbitrum.USDC_CIRCLE },
  { address: "0x9338a4c3De7082E27802DCB6AC5A4502C93D1808", asset: ADDRESSES.arbitrum.USDC_CIRCLE }
];

const BERA_VAULTS = [
  { address: "0x2f852e3102357ffc2283a974d42bd4b4cae9b5aa", asset: ADDRESSES.berachain.WETH },
  { address: "0xf45747fde3586563e1fb9d50f815b70822176a46", asset: ADDRESSES.berachain.HONEY },
  { address: "0x4ea6efbecaabd7ba6e13f4847a518fa34729ac9f", asset: ADDRESSES.berachain.WBERA }
]

async function arbitrumTvl(api) {
  const totalAssets = await api.multiCall({ abi: "uint256:totalAssets", calls: ARBITRUM_VAULTS.map(v => v.address) })

  ARBITRUM_VAULTS.forEach((v, i) => api.add(v.asset, totalAssets[i]))
}

async function beraTvl(api) {
  const totalAssets = await api.multiCall({ abi: "uint256:totalAssets", calls: BERA_VAULTS.map(v => v.address) })

  BERA_VAULTS.forEach((v, i) => api.add(v.asset, totalAssets[i]))
}

module.exports = {
  doublecounted: true,
  arbitrum: {
    tvl: arbitrumTvl,
  },
  berachain: {
    tvl: beraTvl
  },
  hallmarks: [
    ['2023-04-28', "Orange Alpha Vault Launch"], //2023 Apr 28
    ['2023-07-03', "Camelot Vault Launch"], //2023 Jul 3
    ['2023-12-25', "Strategy Vault Launch"], //2023 Dec 25
    ['2024-02-29', "LPDfi Vault Launch"], //2024 Feb 29
  ],
};

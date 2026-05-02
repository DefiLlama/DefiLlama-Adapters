const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const addressBook = {
  polygon: {
    usdc: ADDRESSES.polygon.USDC_CIRCLE,
    aave_v3_usdc: "0xA4D94019934D8333Ef880ABFFbF2FDd611C762BD",  // aPolUSDCn - AAVE USDC (Native)
    morpho_vaults: [
      "0x781FB7F6d845E3bE129289833b04d43Aa8558c42",  // Compound Blue compUSDC
      "0xAcB0DCe4b0FF400AD8F6917f3ca13E434C9ed6bC", // steakhouse-high-yield-usdc
    ],
    msv: "0x14F6DFEE761455247C6bf2b2b052a1F6245dD6FB", // MultiStrategyVault (holds tokens besides usdc)
    reserves: [
      // eTokens
      {name: "eToken Senior BMA", address: "0xF383eF2D31E1d4a19B3e04ca2937DB6A8DA9f229"},
      {name: "eToken Junior Spot", address: "0x6229D78658305a301E177f9dAEa3a0799fd1528C"},
      {name: "eToken Junior DLT", address: "0x9078dDdeA2F82c27791EF78A9ec9ab0f66bfb6F9"},
      {name: "eToken Junior Bliss", address: "0x71d390C243706b713B5D2b077E942223f7A55d00"},
      {name: "eToken Junior Covest", address: "0x92624870dC092C36943682375Df8246BF126D410"},
      {name: "eToken Junior Cliff Horizon", address: "0x623677be20a9Cb9C274c69B00f9d63772d373Cd7"},
      {name: "eToken Junior Rentennials", address: "0x32BEBbfeb5d1B904799729bFaD216baA709615C5"},
      // PremiumsAccounts
      {name: "PremiumsAccount Spot", address: "0x42118Df6EBb18346ca425f1c67AC739E95aD9358"},
      {name: "PremiumsAccount DLT", address: "0x8908d99a4E2fF6b7Bf4563593B02AcBc7bBfaBC1"},
      {name: "PremiumsAccount Bliss", address: "0x11b490292799a0edFE37797592F77151C4483442"},
      {name: "PremiumsAccount Covest", address: "0x1D71E3901dB121F05A4a06F92440108055386355"},
      {name: "PremiumsAccount Cliff Horizon", address: "0x72B74498a400EF16c669D8a23d19e672846a8dcF"},
      {name: "PremiumsAccount Rentennials", address: "0xf7ef82a521D6bD4B2cDAA3a1beB30Fb724930651"},
      // Main CFLs
      {name: "Multi Target CFL", address: "0x6CaCea88486260ef7E6fdE39Bab3236C908D10B5"},
      // MultiStrategy Vault - Vault that aggregates assets of several reserves
      // {name: "MultiStrategy Vault V2", address: "0x14F6DFEE761455247C6bf2b2b052a1F6245dD6FB"},
    ],
  },
  ethereum: {
    usdc: ADDRESSES.ethereum.USDC,
    aave_v3_usdc: "0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c", // aEthUSDC
    morpho_vaults: [
      "0xe108fbc04852B5df72f9E44d7C29F47e7A993aDd", // kpk-usdc-prime
      "0x56bfa6f53669B836D1E0Dfa5e99706b12c373ecf", // skymoney-usdc-risk-capital
      "0x8c106EEDAd96553e64287A5A6839c3Cc78afA3D0", // gauntlet-usdc-prime
    ],
    msv: "0x55bAe6690d46EA94D7F05DF7c80A85E322421fB6", // MultiStrategyVault (holds tokens besides usdc)
    reserves: [
      // eTokens
      {name: "eToken Senior BMA", address: "0xa551285B49A29cBDBAE7fC5C6a61fadC918Ad224"},
      {name: "eToken Junior Spot", address: "0x12a4f34d27B1D54defD4Eb39799971E26D9025E7"},
      {name: "eToken Junior DLT", address: "0x176057C7D384fFC8FeE977615e4bf9c31f5341C2"},
      {name: "eToken Junior Bliss", address: "0x2cF13b8B1467ce1A651767Dcd498C607955A7387"},
      {name: "eToken Junior Cliff Horizon", address: "0xB375f428De1143bD08EB20151559a221744249c7"},
      {name: "eToken Junior Rentennials", address: "0xfA9888B740031FA16E635244A6A33A5851980b34"},
      // PremiumsAccounts
      {name: "PremiumsAccount Spot", address: "0x2153fEe80004e22A13F8D4306BF559E5e4d4f0A9"},
      {name: "PremiumsAccount DLT", address: "0x0B2Aed6E3526942Bf7F9D886dafD9226a553Bbdc"},
      {name: "PremiumsAccount Bliss", address: "0x33918bdc50e021d057145e17D3f31aC97f589e1d"},
      {name: "PremiumsAccount Cliff Horizon", address: "0x585B9B700e557F3C314D5C50137D5D100b4b5A85"},
      {name: "PremiumsAccount Rentennials", address: "0x644dA701E26631dde184da081395ACE07f49C162"},
      // Main CFLs
      {name: "Multi Target CFL", address: "0x5fE11F30647899dca35F9f2f62B8C51856aE33e6"},
    ],
  }
};

const normalize = i => i.toLowerCase()

async function unwrap4626Tokens({ api, tokensAndOwners, }) {
  const tokens = tokensAndOwners.map(i => i[0])
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokensAndOwners.map(i => ({ target: i[0], params: i[1] })), })
  const assets = (await api.multiCall({ abi: 'address:asset', calls: tokens, })).map(normalize)
  const balsInAssets = await api.multiCall({ abi: 'function convertToAssets(uint256) view returns (uint256)', calls: tokensAndOwners.map((i, idx) => ({ target: i[0], params: bals[idx] })), })
  api.addTokens(assets, balsInAssets)
  return api.getBalances()
}

async function tvl(api) {
  const addresses = addressBook[api.chain];
  // Most of the reserves can only have USDC
  const ownerTokens = addresses.reserves.map(i => [[normalize(addresses.usdc)], i.address])
  // The MSV also has AAVE USDC
  ownerTokens.push([[normalize(addresses.usdc), normalize(addresses.aave_v3_usdc)], addresses.msv]);

  // Also Morpho vaults
  for (const vault of addresses.morpho_vaults) {
    await unwrap4626Tokens({api, tokensAndOwners: [[normalize(vault), normalize(addresses.msv)]] });
  }
  return sumTokens2({ api, ownerTokens});
}

module.exports = {
  doublecounted: true,
  methodology: `Sums the USDC amounts, both liquid and invested in Aave/Morpho vaults, of the different protocol reserves (https://docs.ensuro.co/product-docs/smart-contracts/reserves).`,
  polygon: {
    tvl
  },
  ethereum: {
    tvl
  },
  start: '2022-02-01',
  hallmarks: [
    ['2022-12-01', "Ensuro V2 Launch"],
    ['2025-03-18', "Ensuro V3 Launch"],
  ]
};

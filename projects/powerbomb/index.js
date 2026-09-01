// arbitrum
const arbCrvAtricryptoBtcAddr = "0x5bA0139444AD6f28cC28d88c719Ae85c81C307a5"
const arbCrvAtricryptoEthAddr = "0xb88C7a8e678B243a6851b9Fa82a1aA0986574631"
const arbCrvAtricryptoUsdtAddr = "0x8Ae32c034dAcd85a79CFd135050FCb8e6D4207D8"
const arbCrv2poolBtcAddr = "0xE616e7e282709d8B05821a033B43a358a6ea8408"
const arbCrv2poolEthAddr = "0xBE6A4db3480EFccAb2281F30fe97b897BeEf408c"

// polygon
const polyCrvAtricryptoBtcAddr = "0x8799c7fEfB44B8c885b489eB38Fb067c75EbA2ab"
const polyCrvAtricryptoEthAddr = "0x5abbEB3323D4B19C4C371C9B056390239FC0Bf43"
const polyCrvAtricryptoUsdcAddr = "0x7331f946809406F455623d0e69612151655e8261"

// optimism
const opCrvSusd3crvBtcAddr = "0x61F157E08b2B55eB3B0dD137c1D2A73C9AB5888e"
const opCrvSusd3crvEthAddr = "0xA8e39872452BA48b1F4c7e16b78668199d2C41Dd"
const opCrvSethethUsdcAddr = "0xb88C7a8e678B243a6851b9Fa82a1aA0986574631"
const opVeloUsdcSusdBtcAddr = "0x208e2D48b5A080E57792D8b175De914Ddb18F9a8"
const opVeloUsdcSusdEthAddr = "0xee9857e5e1d0089075F75ABe5255fc30695d09FA"
const opVeloFraxUsdcBtcAddr = "0x74f6C748E2DF1c89bf7ed29617A2B41b0f4f82A2"
const opVeloFraxUsdcEthAddr = "0x75633BFAbf0ee9036af06900b8f301Ed8ed29121"
const opVeloUsdcDaiBtcAddr = "0xc23CF2762094a4Dd8DC3D4AaAAfdB38704B0f484"
const opVeloUsdcDaiEthAddr = "0xC15d58452E7CC62F213534dcD1999EDcc4C56E53"
const opVeloUsdcLusdBtcAddr = "0xcaCdE37C8Aef43304e9d7153e668eDb7126Ff755"
const opVeloUsdcLusdEthAddr = "0xf12a8E2Fd857B134381c1B9F6027D4F0eE05295A"
const opVeloUsdcMaiBtcAddr = "0x52671440732589E3027517E22c49ABc04941CF2F"
const opVeloUsdcMaiEthAddr = "0x3BD8d78d77dfA391c5F73c10aDeaAdD9a7f7198C"
const opVeloOpUsdcBtcAddr = "0x2510E5054eeEbED40C3C580ae3241F5457b630D9"
const opVeloOpUsdcEthAddr = "0xFAcB839BF8f09f2e7B4b6C83349B5bbFD62fd659"
const opVeloOpUsdcUsdcAddr = "0x176CC5Ff9BDBf4daFB955003E6f8229f47Ef1E55"
const opVeloWethUsdcBtcAddr = "0xa0Ea9A553cB47658e62Dee4D7b49F7c8Da234B69"
const opVeloWethUsdcEthAddr = "0xd0f9990a611018b5b30BFE1C5433bf5bba2a9868"
const opVeloWethUsdcUsdcAddr = "0x0F0fFF5EA56b0eA2246A926F13181e33Be9FbAEA"
const opVeloWethSethUsdcAddr = "0xcba7864134e1A5326b817676ad5302A009c84d68"
const opCrvPengAddr = "0x68ca3a3BBD306293e693871E45Fe908C04387614"
const opCrvSethPengAddr = "0x98f82ADA10C55BC7D67b92d51b4e1dae69eD0250"

const vaults = {
  arbitrum: [
    arbCrvAtricryptoBtcAddr,
    arbCrvAtricryptoEthAddr,
    arbCrvAtricryptoUsdtAddr,
    arbCrv2poolBtcAddr,
    arbCrv2poolEthAddr,
  ],
  polygon: [
    polyCrvAtricryptoBtcAddr,
    polyCrvAtricryptoEthAddr,
    polyCrvAtricryptoUsdcAddr,
  ],
  optimism: [
    opCrvSusd3crvBtcAddr,
    opCrvSusd3crvEthAddr,
    opCrvSethethUsdcAddr,
    opVeloUsdcSusdBtcAddr,
    opVeloUsdcSusdEthAddr,
    opVeloFraxUsdcBtcAddr,
    opVeloFraxUsdcEthAddr,
    opVeloUsdcDaiBtcAddr,
    opVeloUsdcDaiEthAddr,
    opVeloUsdcLusdBtcAddr,
    opVeloUsdcLusdEthAddr,
    opVeloUsdcMaiBtcAddr,
    opVeloUsdcMaiEthAddr,
    opVeloOpUsdcBtcAddr,
    opVeloOpUsdcEthAddr,
    opVeloOpUsdcUsdcAddr,
    opVeloWethUsdcBtcAddr,
    opVeloWethUsdcEthAddr,
    opVeloWethUsdcUsdcAddr,
    opVeloWethSethUsdcAddr,
    opCrvPengAddr,
    opCrvSethPengAddr,
  ],
}

module.exports = {
  methodology: "TVL come from amount deposit into pools such as Curve & Velodrome.",
  misrepresentedTokens: true,
}

Object.keys(vaults).forEach(chain => {
  const vault = vaults[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const balances = await api.multiCall({ abi: "uint256:getAllPoolInUSD", calls: vault, })
      api.addUSDValue(balances.reduce((acc, i) => acc + +Math.round(i / 1e18), 0))
    }
  }
})
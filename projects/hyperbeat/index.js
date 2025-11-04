const { sumERC4626VaultsExport } = require('../helper/erc4626');

const config = {
  morphoVaults: {
    '0x5eEC795d919FA97688Fb9844eeB0072E6B846F9d': '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34',
    '0x53A333e51E96FE288bC9aDd7cdC4B1EAD2CD2FfA': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
    '0x0571362ba5EA9784a97605f57483f865A37dBEAA': '0xBe6727B535545C67d5cAa73dEa54865B92CF7907',
    '0xd19e3d00f8547f7d108abfd4bbb015486437b487': '0x5555555555555555555555555555555555555555',
    '0x4346C98E690c17eFbB999aE8e1dA96B089bE320b': '0x9ab96A4668456896d45c301Bc3A15Cee76AA7B8D',
    '0xe5ADd96840F0B908ddeB3Bd144C0283Ac5ca7cA0': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
    '0xD3A9Cb7312B9c29113290758f5ADFe12304cd16A': '0x0aD339d66BF4AeD5ce31c64Bc37B3244b6394A77',
    '0x3Bcc0a5a66bB5BdCEEf5dd8a659a4eC75F3834d8': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
    '0x51F64488d03D8B210294dA2BF70D5db0Bc621B0c': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // Re7 USDT0
    '0x182b318A8F1c7C92a7884e469442a610B0e69ed2': '0x5555555555555555555555555555555555555555', // Re7 HYPE
    '0x92B518e1cD76dD70D3E20624AEdd7D107F332Cff': '0x5555555555555555555555555555555555555555', // Hyperithm HYPE
    '0x264a06Fd7A7C9E0Bfe75163b475E2A3cc1856578': '0x5555555555555555555555555555555555555555', // Gauntlet HYPE
    '0x08C00F8279dFF5B0CB5a04d349E7d79708Ceadf3': '0xb88339cb7199b77e23db6e890353e22632ba630f', // Gauntlet USDC
    '0x4851D4891321035729713D43bE1F4bb883Dffd34': '0xb88339cb7199b77e23db6e890353e22632ba630f', // MEV USDC
  },
  midasVaults: {
    '0x5e105266db42f78fa814322bce7f388b4c2e61eb': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // USDT0
    '0x6EB6724D8D3D4FF9E24d872E8c38403169dC05f8': '0xf4D9235269a96aaDaFc9aDAe454a0618eBE37949', // xAUT
    '0xD66d69c288d9a6FD735d7bE8b2e389970fC4fD42': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // wVLP  
    '0x949a7250Bb55Eb79BC6bCC97fCd1C473DB3e6F29': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // dnHYPE
    '0x8858A307a85982c2B3CB2AcE1720237f2f09c39B': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // dnPUMP
    '0x057ced81348D57Aad579A672d521d7b4396E8a61': '0xb88339CB7199b77E23DB6E890353E22632Ba630f', //hbUSDC
    '0x441794D6a8F9A3739F5D4E98a728937b33489D29': '0x5555555555555555555555555555555555555555', // liquidHYPE
    '0x81e064d0eB539de7c3170EDF38C1A42CBd752A76': '0x5555555555555555555555555555555555555555', // lstHYPE
  },
  midasVaultTokenOracles: {
    '0x5e105266db42f78fa814322bce7f388b4c2e61eb': '0xac3d811f5ff30aa3ab4b26760d0560faf379536a', // USDT0
    '0x6EB6724D8D3D4FF9E24d872E8c38403169dC05f8': '0xf3dB9f59f9C90495D1c9556fC5737A679720921d', // xAUT
    '0xD66d69c288d9a6FD735d7bE8b2e389970fC4fD42': '0xA9fFe62E785324cb39cB5E2B3Ef713674391d31F', // wVLP  
    '0x949a7250Bb55Eb79BC6bCC97fCd1C473DB3e6F29': '0xEB3459316211aB3e2bfee836B989f50fe08AA469', // dnHYPE
    '0x8858A307a85982c2B3CB2AcE1720237f2f09c39B': '0x707e99655f24747cECEB298B3AAF7FA721EC77fC', // dnPUMP
    '0x057ced81348D57Aad579A672d521d7b4396E8a61': '0xc82CAd78983436BddfcAf0F21316207D87b87462', //hbUSDC 
    '0x441794D6a8F9A3739F5D4E98a728937b33489D29': '0x1CeaB703956e24b18a0AF6b272E0bF3F499aCa0F', // liquidHYPE
    '0x81e064d0eB539de7c3170EDF38C1A42CBd752A76': '0x2b959a9Deb8e62FaaEA1b226F3bbcbcC0Af31560', // lstHYPE
  },
  hyperbeatInfraVaults: {
    '0x4Cc221cf1444333510a634CE0D8209D2D11B9bbA': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // nLP
  },
  hyperbeatInfraVaultTokenOracles: {
    '0x4Cc221cf1444333510a634CE0D8209D2D11B9bbA': '0xC23cdFe493bB5E69bedfCF6E710f508710ac668B', // nLP
  }

}

const sixDecimalTokens = [
  '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb', // USDT0
  '0x9ab96a4668456896d45c301bc3a15cee76aa7b8d', // rUSDC
  '0xf4d9235269a96aadafc9adae454a0618ebe37949', // xAUT
  '0xb88339cb7199b77e23db6e890353e22632ba630f', // USDC
]



const tvlMidasVaults = async (api) => {
  const { midasVaults = {}, midasVaultTokenOracles = {} } = config
  const vaultTokens = Object.keys(midasVaults)
  const supplies = await api.multiCall({ calls: vaultTokens, abi: 'erc20:totalSupply' })
  const tokenOracles = Object.values(midasVaultTokenOracles)
  const exchangeRates = await api.multiCall({ calls: tokenOracles, abi: 'int256:lastAnswer' })


  for (const [index, vault] of vaultTokens.entries()) {
    const underlying = midasVaults[vault].toLowerCase()

    const tvlInToken = sixDecimalTokens.includes(underlying) ? supplies[index] * exchangeRates[index] / 1e20 : supplies[index] * exchangeRates[index] / 1e8;

    api.add(underlying, tvlInToken)
  }


}
const tvlHyperbeatInfraVaults = async (api) => {
  const { hyperbeatInfraVaults = {}, hyperbeatInfraVaultTokenOracles = {} } = config
  const vaultTokens = Object.keys(hyperbeatInfraVaults)
  const supplies = await api.multiCall({ calls: vaultTokens, abi: 'erc20:totalSupply' })
  const tokenOracles = Object.values(hyperbeatInfraVaultTokenOracles)
  const exchangeRates = await api.multiCall({ calls: tokenOracles, abi: 'int128:getRate' })
  for (const [index, vault] of vaultTokens.entries()) {
    const underlying = hyperbeatInfraVaults[vault].toLowerCase()
    const tvlInToken = supplies[index] * exchangeRates[index] / 1e8;
    api.add(underlying, tvlInToken)
  }
}

const morphoBeatTvl = async (api) => {
  const { morphoVaults = {} } = config
  const vaultToUnderlyings = { ...morphoVaults }
  const vaults = Object.keys(vaultToUnderlyings)
  const assets = await api.multiCall({
    abi: "function asset() view returns (address)",
    calls: vaults,
  });

  const totalAssets = await api.multiCall({
    abi: "function totalAssets() view returns (uint256)",
    calls: vaults,
  });

  assets.forEach((asset, i) => {
    if (asset && totalAssets[i]) {
      api.add(asset, totalAssets[i]);
    }
  });

}

const tvl = async (api) => {

  await tvlMidasVaults(api)
  await tvlHyperbeatInfraVaults(api)
  await morphoBeatTvl(api)


  return sumERC4626VaultsExport({ vaults: ['0x96C6cBB6251Ee1c257b2162ca0f39AA5Fa44B1FB', '0xc061d38903b99aC12713B550C2CB44B221674F94'], isOG4626: true })(api)
}

module.exports = {
  doublecounted: true,
  methodology: 'Measures TVL by calculating all tokens held by each vault.',
  start: 1738368000,
  hyperliquid: { tvl }
}
const { sumERC4626VaultsExport } = require('../helper/erc4626');
const abi = require("../helper/abis/morpho.json");

const ADDRESSES = require('../helper/coreAssets.json')

const morphoBlue = "0x68e37dE8d93d3496ae143F2E900490f6280C57cD"
const morphoBeatMarkets = [
  "0x09ed416b38a29e077383da5ae4200523e54e33ecff6e148c2590969a9852513f",
  "0x0a2e456ebd22ed68ae1d5c6b2de70bc514337ac588a7a4b0e28f546662144036",
  "0x0e5172eeb1bbf076fccc101f4a47e6f2db42eb7c39e44bd015c64b5e63e3da3d",
  "0x0ecf5be1fadf4bec3f79ce196f02a327b507b34d230c0f033f4970b1b510119c",
  "0x15f505f8dda26a523f7490ad0322f3ed4f325a54fd50832bc65e4bd75e3dca54",
  "0x19bbcc95b876740c0765ed1e4bac1979c4aea1b4bfbfee0e61dc1fe76a6887dc",
  "0x19e47d37453628ebf0fd18766ce6fee1b08ea46752a5da83ca0bfecb270d07e8",
  "0x1da89208e6cb5173e97a83461853b8400de4f7c37542cf010a10579a5f7ca451",
  "0x1df0d0ebcdc52069692452cb9a3e5cf6c017b237378141eaf08a05ce17205ed6",
  "0x216bd19960f140177a4a3fb9cf258edcbadb1f5d54740fc944503bff4a00e65e",
  "0x2acd218c67daa94dd2f92e81f477ffc9f8507319f0f2d698eae5ed631ae14039",
  "0x2b62c4153d81d5b5a233d1d2b7ef899d3fca4076d458e215ff3a00176b415b0d",
  "0x31aaa663d718e83ea15326ec110c4bcf5e123585d0b6c4d0ad61a50c4aa65b1e",
  "0x45af9c72aa97978e143a646498c8922058b7c6f18b6f7b05d7316c8cf7ab942f",
  "0x53bf81793c2cc384c19a3bc9b032467e179a390a9225cd9542742ac10f539cc2",
  "0x5ecb7a25d51c870ec57f810c880e3e20743e56d0524575b7b8934a778aaec1af",
  "0x5ef35fe4418a6bcfcc70fe32efce30074f22e9a782f81d432c1e537ddbda11e2",
  "0x64e7db7f042812d4335947a7cdf6af1093d29478aff5f1ccd93cc67f8aadfddc",
  "0x65f2a559764859a559d8c39604cf665942bab7d10dfaa1b82e914c9d351038d4",
  "0x6eb4ce92dc1d89abd40f9634249ec28e8ab4e3f9bef0ab47ea784773c140d4ef",
  "0x707dddc200e95dc984feb185abf1321cabec8486dca5a9a96fb5202184106e54",
  "0x70c171a5123103f82a10b18be5efe49bd6cf21423d6f8320235ef746a24184df",
  "0x7268244d330f1462f77ded7a14e2f868893e86e76e8b8eaa869405d588aff6ce",
  "0x78f6b57d825ef01a5dc496ad1f426a6375c685047d07a30cd07ac5107ffc7976",
  "0x8eb8cfe3b1ac8f653608ae09fb099263fa2fe25d4a59305c309937292c2aeee9",
  "0x964e7d1db11bdf32262c71274c297dcdb4710d73acb814f04fdca8b0c7cdf028",
  "0xa24d04c3aff60d49b3475f0084334546cbf66182e788b6bf173e6f9990b2c816",
  "0xa62327642e110efd38ba2d153867a8625c8dc40832e1d211ba4f4151c3de9050",
  "0xa7fe39c692f0192fb2f281a6cc16c8b2e1c8f9b9f2bc418e0c0c1e9374bf4b04",
  "0xace279b5c6eff0a1ce7287249369fa6f4d3d32225e1629b04ef308e0eb568fb0",
  "0xae019cf2bf3d650ab4037986405c80ebb83fec18fb120c71bf8889d327caef0f",
  "0xb142d65d7c624def0a9f4b49115b83f400a86bd2904d4f3339ec4441e28483ea",
  "0xb5b575e402c7c19def8661069c39464c8bf3297b638e64d841b09a4eb2807de5",
  "0xbc15a1782163f4be46c23ac61f5da50fed96ad40293f86a5ce0501ce4a246b32",
  "0xc5526286d537c890fdd879d17d80c4a22dc7196c1e1fff0dd6c853692a759c62",
  "0xc59a3f8a3918d89ebef44ee1dcda435719f543cfd3f37ead7e74852ea5931581",
  "0xd13b1bad542045a8dc729fa0ffcc4f538b9771592c2666e1f09667dcf85804fc",
  "0xd173e9d80aeacac486b46a9a849ecb386cec260cc7dd5be0db3505a0f9f93fb5",
  "0xd2e8f6fd195556222d7a0314d4fb93fdf84ae920faaebba6dbcf584ac865e1f5",
  "0xd5a9fba2309a0b85972a96f2cc45f9784e786d712944d8fc0b31a6d9cb4f21d3",
  "0xd5c5b5db889eb5d4f4026b9704cddffbc1356732a37c2b543330c10756ae7a18",
  "0xdb2cf3ad3ef91c9bb673bf35744e7141bc2950b27a75c8d11b0ead9f6742d927",
  "0xe0ede98b4425285a9c93d51f8ba27d9a09bc0033874e4a883d3f29d41f9f2e4a",
  "0xe41ace68f2de7be8e47185b51ddc23d4a58aac4ce9f8cc5f9384fe26f2104ec8",
  "0xe7aa046832007a975d4619260d221229e99cc27da2e6ef162881202b4cd2349b",
  "0xe9a9bb9ed3cc53f4ee9da4eea0370c2c566873d5de807e16559a99907c9ae227",
  "0xebeabb17bd69d4b8ed6929a821d69478b564f4cc604d0995944c9da8b5cb3f04",
  "0xed00791e29eb08c9bc0d8b389fe1f00084699baf2a785ba2a42e915706b17b82",
  "0xf25db2433ae650155eae04ebd8b3795d19bfcb318d22926a8a5e746e8028e0a8",
  "0xf9f0473b23ebeb82c83078f0f0f77f27ac534c9fb227cb4366e6057b6163ffbf",
  "0xfbe436e9aa361487f0c3e4ff94c88aea72887a4482c6b8bcfec60a8584cdb05e",
  "0xfdece686f16877984325c7a1c192e0f18862bae3829d000a1a62b5bc2b31d4ef"
]

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


const nullAddress = ADDRESSES.null
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

  const marketInfos = await api.multiCall({ target: morphoBlue, calls: morphoBeatMarkets, abi: abi.morphoBlueFunctions.idToMarketParams })
  const marketDatas = await api.multiCall({ target: morphoBlue, calls: morphoBeatMarkets, abi: abi.morphoBlueFunctions.market })
  marketDatas.forEach((data, idx) => {
    const { collateralToken, loanToken } = marketInfos[idx];

    api.add(loanToken, data.totalBorrowAssets * -1);
    api.add(loanToken, data.totalSupplyAssets);

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
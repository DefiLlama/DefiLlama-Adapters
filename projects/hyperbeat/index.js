const ADDRESSES = require('../helper/coreAssets.json')
const { sumERC4626VaultsExport } = require('../helper/erc4626');

const liquidHypeStrategist = "0x83a80e5b64086197c01cbb123df2aea79a149c1d"
const oracle = "0x1ceab703956e24b18a0af6b272e0bf3f499aca0f"
const beHype = "0xd8FC8F0b03eBA61F64D08B0bef69d80916E5DdA9"

const config = {
  morphoVaults: {
    '0x5eEC795d919FA97688Fb9844eeB0072E6B846F9d': ADDRESSES.arbitrum.USDe,
    '0x53A333e51E96FE288bC9aDd7cdC4B1EAD2CD2FfA': ADDRESSES.corn.USDT0,
    '0x0571362ba5EA9784a97605f57483f865A37dBEAA': '0xBe6727B535545C67d5cAa73dEa54865B92CF7907',
    '0xd19e3d00f8547f7d108abfd4bbb015486437b487': ADDRESSES.hyperliquid.WHYPE,
    '0x4346C98E690c17eFbB999aE8e1dA96B089bE320b': '0x9ab96A4668456896d45c301Bc3A15Cee76AA7B8D',
    '0xe5ADd96840F0B908ddeB3Bd144C0283Ac5ca7cA0': ADDRESSES.corn.USDT0,
    '0xD3A9Cb7312B9c29113290758f5ADFe12304cd16A': '0x0aD339d66BF4AeD5ce31c64Bc37B3244b6394A77',
    '0x3Bcc0a5a66bB5BdCEEf5dd8a659a4eC75F3834d8': ADDRESSES.corn.USDT0,
    '0x51F64488d03D8B210294dA2BF70D5db0Bc621B0c': ADDRESSES.corn.USDT0, // Re7 USDT0
    '0x182b318A8F1c7C92a7884e469442a610B0e69ed2': ADDRESSES.hyperliquid.WHYPE, // Re7 HYPE
    '0x92B518e1cD76dD70D3E20624AEdd7D107F332Cff': ADDRESSES.hyperliquid.WHYPE, // Hyperithm HYPE
    '0x264a06Fd7A7C9E0Bfe75163b475E2A3cc1856578': ADDRESSES.hyperliquid.WHYPE, // Gauntlet HYPE
    '0x08C00F8279dFF5B0CB5a04d349E7d79708Ceadf3': '0xb88339cb7199b77e23db6e890353e22632ba630f', // Gauntlet USDC
    '0x4851D4891321035729713D43bE1F4bb883Dffd34': '0xb88339cb7199b77e23db6e890353e22632ba630f', // MEV USDC
  },
  standaloneVaults: {
    '0x5e105266db42f78fa814322bce7f388b4c2e61eb': ADDRESSES.corn.USDT0, // USDT0
    '0x6EB6724D8D3D4FF9E24d872E8c38403169dC05f8': '0xf4D9235269a96aaDaFc9aDAe454a0618eBE37949', // xAUT
    '0x81e064d0eB539de7c3170EDF38C1A42CBd752A76': ADDRESSES.hyperliquid.WHYPE, // lstHYPE
    '0x441794D6a8F9A3739F5D4E98a728937b33489D29': ADDRESSES.hyperliquid.WHYPE, // liquidHYPE
    '0xD66d69c288d9a6FD735d7bE8b2e389970fC4fD42': ADDRESSES.corn.USDT0, // wVLP
    '0x949a7250Bb55Eb79BC6bCC97fCd1C473DB3e6F29': ADDRESSES.corn.USDT0, // dnHYPE
    '0x8858A307a85982c2B3CB2AcE1720237f2f09c39B': ADDRESSES.corn.USDT0, // dnPUMP
    // '0xd8FC8F0b03eBA61F64D08B0bef69d80916E5DdA9': ADDRESSES.hyperliquid.WHYPE, // beHYPE → lst adapter
    '0x057ced81348D57Aad579A672d521d7b4396E8a61': '0xb88339CB7199b77E23DB6E890353E22632Ba630f', //hbUSDC
    '0x4Cc221cf1444333510a634CE0D8209D2D11B9bbA': ADDRESSES.corn.USDT0, // nLP
  }
}

const sixDecimalTokens = [
  ADDRESSES.corn.USDT0, // USDT0
  '0x9ab96a4668456896d45c301bc3a15cee76aa7b8d', // rUSDC
  '0xf4d9235269a96aadafc9adae454a0618ebe37949', // xAUT
  '0xb88339cb7199b77e23db6e890353e22632ba630f', // USDC
]

const unwrapBeHype = async (api, underlying, supply) => {
  const [lastAnswer, beHypeBalance] = await Promise.all([
    api.call({ target: oracle, abi: 'uint256:lastAnswer' }),
    api.call({ target: beHype, params: [liquidHypeStrategist], abi: 'erc20:balanceOf' })
  ])


  const beHypeToHypeShare = beHypeBalance * lastAnswer / 1e8
  api.add(underlying, supply-beHypeToHypeShare) // subtraction of beHype’s share present in the vault
  api.add(beHype, beHypeBalance)
}

const tvl = async (api) => {
  const { morphoVaults = {}, standaloneVaults = {} } = config
  const vaultToUnderlyings = { ...morphoVaults, ...standaloneVaults }
  const vaults = Object.keys(vaultToUnderlyings)
  const supplies = await api.multiCall({ calls: vaults, abi: 'erc20:totalSupply' })

  for (const [index, vault] of vaults.entries()) {
    const underlying = vaultToUnderlyings[vault].toLowerCase()
    const supply = supplies[index]

    if (vault == "0x441794D6a8F9A3739F5D4E98a728937b33489D29") {
      await unwrapBeHype(api, underlying, supply);
      continue
    }

    const sixDecimalTokensLower = sixDecimalTokens.map(t => t.toLowerCase());
    const scaled = sixDecimalTokensLower.includes(underlying) ? supply / 1e18 * 1e6 : supply
    api.add(underlying, scaled)
  }

  return sumERC4626VaultsExport({ vaults: ['0x96C6cBB6251Ee1c257b2162ca0f39AA5Fa44B1FB', '0xc061d38903b99aC12713B550C2CB44B221674F94'], isOG4626: true })(api) 
}

module.exports = {
  doublecounted: true,
  methodology: 'Measures TVL by calculating all tokens held by each vault.',
  start: 1738368000,
  hyperliquid: { tvl }
}
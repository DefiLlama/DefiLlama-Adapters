const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const dai = ADDRESSES.ethereum.DAI
const usdc = ADDRESSES.ethereum.USDC
const polygonDai = ADDRESSES.polygon.DAI
const polygonUsdc = ADDRESSES.polygon.USDC

const arbitrumDai = ADDRESSES.optimism.DAI
const arbitrumUsdc = ADDRESSES.arbitrum.USDC

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [dai, "0xa57fC404f69fCE71CA26e26f0A4DF7F35C8cd5C3"],
        [dai, "0x187922d4235D10239b2c6CCb2217aDa724F56DDA"],
        [usdc, "0x1BB632a08936e17Ee3971E6Eeb824910567e120B"],
        [usdc, "0x054FBeBD2Cb17205B57fb56a426ccc54cAaBFaBC"]
      ]
    }),
  },
  polygon: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [polygonDai, "0x164c668204Ce54558431997A6DD636Ee4E758b19"],
        [polygonDai, "0x90E6c403c02f72986a98E8a361Ec7B7C8BC29259"],
        [polygonUsdc, "0xEeb6f0C2261E21b657A27582466e5aD9acC072D7"],
        [polygonUsdc, "0xA2b3501d34edA289F0bEF1cAf95E5D0111032F36"]
      ]
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [arbitrumDai, "0xE46277336d9CC2eBe7b24bA7268624F5f1495611"],
        [arbitrumDai, "0xf613b55131cf8a69c5b4f62d0d5e5d2c2d9c3280"],
        [arbitrumUsdc, "0xF9b04Aad2612D3d664F41E9aF5711953E058ff52"],
        [arbitrumUsdc, "0xdf87072ac4722431861837492edf7adbfec0efa9"],
      ]
    }),
  }
}
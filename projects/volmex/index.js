const sdk = require('@defillama/sdk')
const {sumTokens} = require('../helper/unwrapLPs')

const dai = "0x6b175474e89094c44da98b954eedeac495271d0f"
const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
async function eth(timestamp, block) {
    const balances = {}
    await sumTokens(balances, [
        [dai, "0xa57fC404f69fCE71CA26e26f0A4DF7F35C8cd5C3"],
        [dai, "0x187922d4235D10239b2c6CCb2217aDa724F56DDA"],
        [usdc, "0x1BB632a08936e17Ee3971E6Eeb824910567e120B"],
        [usdc, "0x054FBeBD2Cb17205B57fb56a426ccc54cAaBFaBC"]
    ], block)
    return balances
}

const polygonDai = "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"
const polygonUsdc = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
async function polygon(timestamp, block, chainBlocks) {
    const balances = {}
    await sumTokens(balances, [
        [polygonDai, "0x164c668204Ce54558431997A6DD636Ee4E758b19"],
        [polygonDai, "0x90E6c403c02f72986a98E8a361Ec7B7C8BC29259"],
        [polygonUsdc, "0xEeb6f0C2261E21b657A27582466e5aD9acC072D7"],
        [polygonUsdc, "0xA2b3501d34edA289F0bEF1cAf95E5D0111032F36"]
    ], chainBlocks.polygon, 'polygon', addr=>`polygon:${addr}`)
    return balances
}

module.exports = {
    ethereum:{
        tvl: eth,
    },
    polygon: {
        tvl: polygon
    },
    tvl: sdk.util.sumChainTvls([eth, polygon])
}
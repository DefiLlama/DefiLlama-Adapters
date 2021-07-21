const sdk = require('@defillama/sdk')
const {sumTokens} = require('../helper/unwrapLPs')

const dai = "0x6b175474e89094c44da98b954eedeac495271d0f"
async function eth(timestamp, block) {
    const balances = {}
    await sumTokens(balances, [
        [dai, "0xa57fC404f69fCE71CA26e26f0A4DF7F35C8cd5C3"],
        [dai, "0x187922d4235D10239b2c6CCb2217aDa724F56DDA"]
    ], block)
    return balances
}

const polygonDai = "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"
async function polygon(timestamp, block, chainBlocks) {
    const balances = {}
    await sumTokens(balances, [
        [polygonDai, "0x164c668204Ce54558431997A6DD636Ee4E758b19"],
        [polygonDai, "0x90E6c403c02f72986a98E8a361Ec7B7C8BC29259"]
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
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const {sumTokens} = require('../helper/unwrapLPs')

const dai = ADDRESSES.ethereum.DAI
const usdc = ADDRESSES.ethereum.USDC
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

const polygonDai = ADDRESSES.polygon.DAI
const polygonUsdc = ADDRESSES.polygon.USDC
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

const arbitrumDai = ADDRESSES.optimism.DAI
const arbitrumUsdc = ADDRESSES.arbitrum.USDC
async function arbitrum(timestamp, block, chainBlocks) {
    const balances = {}
    await sumTokens(balances, [
        [arbitrumDai, "0xE46277336d9CC2eBe7b24bA7268624F5f1495611"],
        [arbitrumDai, "0xf613b55131cf8a69c5b4f62d0d5e5d2c2d9c3280"],
        [arbitrumUsdc, "0xF9b04Aad2612D3d664F41E9aF5711953E058ff52"],
        [arbitrumUsdc, "0xdf87072ac4722431861837492edf7adbfec0efa9"],
    ], chainBlocks.arbitrum, 'arbitrum', addr=>`arbitrum:${addr}`)
    return balances
}


module.exports = {
    ethereum:{
        tvl: eth,
    },
    polygon: {
        tvl: polygon
    },
    arbitrum:{
        tvl: arbitrum
    }
}
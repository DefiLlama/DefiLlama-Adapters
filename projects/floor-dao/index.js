const { ohmTvl } = require('../helper/ohm')
const BigNumber = require('bignumber.js');
// https://docs.floor.xyz/fundamentals/treasury
const { unwrapUniswapV3LPs, sumTokens } = require("../helper/unwrapLPs");

// Tokens in treasury
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const PUNK = '0x269616d549d7e8eaa82dfb17028d0b212d11232a'
const xPUNK = '0x08765c76c758da951dc73d3a8863b34752dd76fb'
const PUNKWETH = '0x0463a06fbc8bf28b3f120cd1bfc59483f099d332'
const xPUNKWETH = '0xfb2f1c0e0086bcef24757c3b9bfe91585b1a280f'

const treasury = '0x91E453f442d25523F42063E1695390e325076ca2'
const stakingAddress = '0x759c6de5bca9ade8a1a2719a31553c4b7de02539' 
const FLOOR = '0xf59257E961883636290411c11ec5Ae622d19455e' 
const treasuryTokens = [
    [WETH, false], [PUNK, false], [xPUNK, false], // WETH, PUNK and xPUNK
    [PUNKWETH, true],  // PUNK-ETH SLP
    [xPUNKWETH, false],  // xPUNKWETH is 1:1 with PUNK-WETH-SLP
]
module.exports = ohmTvl(treasury, treasuryTokens, 'ethereum', stakingAddress, FLOOR)

const tvl = module.exports.ethereum.tvl 
const transform = a => `ethereum:${a}`
module.exports.ethereum.tvl = async (time, ethBlock, chainBlocks) => {
    const balances = await tvl(time, ethBlock, chainBlocks)
    console.log('balances', balances)
    balances[transform(PUNK)] = BigNumber(balances[transform(PUNK)]).plus(BigNumber(balances[transform(xPUNK)])).toFixed(0)
    balances['ethereum:' + xPUNK] = 0
    return balances
}

const dao_treasury = '0xA9d93A5cCa9c98512C8C56547866b1db09090326'
module.exports.ethereum.treasury = async (time, ethBlock, chainBlocks) => {
    const balances = {}

    await sumTokens(balances, [[FLOOR, dao_treasury]], ethBlock, "ethereum", transform)
    // const univ3_Positions = []
    // await unwrapUniswapV3LPs(balances, univ3_Positions, ethBlock, 'ethereum', transform)

    return balances
}
// https://gnosis-safe.io/app/eth:/balances
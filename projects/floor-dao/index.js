const { ohmTvl } = require('../helper/ohm')
const BigNumber = require('bignumber.js');
// https://docs.floor.xyz/fundamentals/treasury

// Tokens in treasury
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const PUNK = '0x269616d549d7e8eaa82dfb17028d0b212d11232a'
const xPUNK = '0x08765c76c758da951dc73d3a8863b34752dd76fb'

const treasury = '0x91E453f442d25523F42063E1695390e325076ca2'
const stakingAddress = '0x759c6de5bca9ade8a1a2719a31553c4b7de02539' // staking contract
const stakingToken = '0xf59257E961883636290411c11ec5Ae622d19455e' // FLOOR 
const treasuryTokens = [
    [WETH, false], [PUNK, false], [xPUNK, false], // WETH, PUNK and xPUNK
    ['0x0463a06fbc8bf28b3f120cd1bfc59483f099d332', true],  // PUNK-ETH SLP
    // ['0xfb2f1c0e0086bcef24757c3b9bfe91585b1a280f', false],  // xPUNKWETH
]

module.exports = ohmTvl(treasury, treasuryTokens, 'ethereum', stakingAddress, stakingToken)

const tvl = module.exports.ethereum.tvl 
module.exports.ethereum.tvl = async (time, ethBlock, chainBlocks) => {
    const balances = await tvl(time, ethBlock, chainBlocks)
    console.log('balances', balances)
    balances['ethereum:' + PUNK] = BigNumber(balances['ethereum:' + PUNK]).plus(BigNumber(balances['ethereum:' + xPUNK])).toFixed(0)
    balances['ethereum:' + xPUNK] = 0
    return balances
}

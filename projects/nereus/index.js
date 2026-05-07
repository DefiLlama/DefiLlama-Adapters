const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokenAndContract = [
    [ADDRESSES.avax.WAVAX, "0x6d9336ce867606Dcb1aeC02C8Ef0EDF0FF22d247"], // nWAVAX
    [ADDRESSES.avax.WETH_e, "0x92F79834fC52f0Aa328f991C91185e081ea4f957"], // nWETH
    [ADDRESSES.avax.WBTC_e, "0x3D8231cE419886a5D400dD5a168C8917aEeAB25C"], // nWBTC
    [ADDRESSES.avax.DAI, "0x6Ce0e6e81Dc7A5D997E6169cD5f8C982DA83e49e"], // nDAI
    [ADDRESSES.avax.USDT_e, "0x29F511e6f62118b27D9B47d1AcD6fDd5cD0B4C64"], // nUSDT
    [ADDRESSES.avax.USDC_e, "0x723191E7F8D87eC22E682c13Df504E5E3432e53E"] // nUSDC
]

module.exports = {
    avax:{
        tvl: sumTokensExport({ tokensAndOwners: tokenAndContract})
    }
}
/*==================================================
  Modules
  ==================================================*/
const { sumTokens } = require('../helper/unwrapLPs')

/*** Astar Addresses ***/
const usdPoolAddress = "0x417E9d065ee22DFB7CC6C63C403600E27627F333";
const oUSDPoolAddress = "0xD18AbE9bcedeb5A9a65439e604b0BE8db0bdB176"
const BAIPoolAddress = "0x290c7577D209c2d8DB06F377af31318cE31938fB"
const StarlayPoolAddress = "0x0fB8C4eB33A30eBb01588e3110968430E3E69D58"
const owners = [usdPoolAddress]
const owners_oUSD = [oUSDPoolAddress]
const owners_BAI = [BAIPoolAddress]
const owners_Starlay = [StarlayPoolAddress]

const DAI = '0x6De33698e9e9b787e09d3Bd7771ef63557E148bb'
const USDC = '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98'
const USDT = '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283'
const BUSD = '0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E'
const oUSD = '0x29F6e49c6E3397C3A84F715885F9F233A441165C';
const BAI = '0x733ebcC6DF85f8266349DEFD0980f8Ced9B45f35';
const LDAI = '0x4dd9c468A44F3FEF662c35c1E9a6108B70415C2c'
const LUSDC = '0xc404e12d3466accb625c67dbab2e1a8a457def3c'
const LUSDT = '0x430D50963d9635bBef5a2fF27BD0bDDc26ed691F'
const LBUSD = '0xb7aB962c42A8Bb443e0362f58a5A43814c573FFb'

const fourPool = { DAI, USDC, USDT, BUSD }
const oUSDPool = { oUSD }
const BAIPool = { BAI }
const starlayPool = { LDAI, LUSDC, LUSDT, LBUSD }

const tokenMappings = {
    [USDC]: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    [USDT]: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    [DAI]: "0x6b175474e89094c44da98b954eedeac495271d0f",
    [BUSD]: "0x4fabb145d64652a948d72533023f6e7a623c7c53"
}

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, _block, { astar: block }) {
    const chain = 'astar'
    const toa = []

    //======4pool=======
    Object.values(fourPool).forEach(t => {
        owners.forEach(o => toa.push([t, o]))
    })

    //======Starlay 4pool=======
    Object.values(starlayPool).forEach(t => {
        owners_Starlay.forEach(o => toa.push([t, o]))
    })

    //=======oUSD========
    Object.values(oUSDPool).forEach(t => {
        owners_oUSD.forEach(o => toa.push([t, o]))
    })
    
    //=======BAI========
    Object.values(BAIPool).forEach(t => {
        owners_BAI.forEach(o => toa.push([t, o]))
    })

    return sumTokens({}, toa, block, chain)
}


/*==================================================
  Exports
  ==================================================*/

module.exports = {
    misrepresentedTokens: true,
    astar: {
        start: 1650117600, // 2022/04/16 14:00 UTC
        tvl, // tvl adapter
    },
};
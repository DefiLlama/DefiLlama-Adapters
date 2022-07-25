/*==================================================
  Modules
  ==================================================*/
const { sumTokens } = require('../helper/unwrapLPs')
const { getFixBalances } = require('../helper/portedTokens')

/*** Astar Addresses ***/
const usdPoolAddress = "0x417E9d065ee22DFB7CC6C63C403600E27627F333";
const oUSDPoolAddress = "0xD18AbE9bcedeb5A9a65439e604b0BE8db0bdB176"
const BAIPoolAddress = "0x290c7577D209c2d8DB06F377af31318cE31938fB"
const StarlayPoolAddress = "0x0fB8C4eB33A30eBb01588e3110968430E3E69D58"
const JPYCPoolAddress = "0xEd6e10Fc171f2768D9c056260b18D814035F8266"
const WBTCPoolAddress = "0xff390905269Ac30eA640dBaBdF5960D7B860f2CF"
const WETHPoolAddress = "0x46F63Ec42eFcf972FCeF2330cC22e6ED1fCEB950"
const WBNBPoolAddress = "0xA82222d8b826E6a741f6cb4bFC6002c34D32fF67"
const nASTRPoolAddress = "0xEEa640c27620D7C448AD655B6e3FB94853AC01e3"
const owners = [usdPoolAddress]
const owners_oUSD = [oUSDPoolAddress]
const owners_BAI = [BAIPoolAddress]
const owners_Starlay = [StarlayPoolAddress]
const owners_JPYC = [JPYCPoolAddress]
const owners_WBTC = [WBTCPoolAddress]
const owners_WETH = [WETHPoolAddress]
const owners_WBNB = [WBNBPoolAddress]
const owners_nASTR = [nASTRPoolAddress]

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
const JPYC = '0x431d5dff03120afa4bdf332c61a6e1766ef37bdb'
const WBTC = '0xad543f18cff85c77e140e3e5e3c3392f6ba9d5ca'
const WETH = '0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c'
const WBNB = '0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52'
const nASTR = '0xE511ED88575C57767BAfb72BfD10775413E3F2b0'
const wASTR = '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720'

const fourPool = { DAI, USDC, USDT, BUSD }
const oUSDPool = { oUSD }
const BAIPool = { BAI }
const starlayPool = { LDAI, LUSDC, LUSDT, LBUSD }
const JPYCPool = { JPYC };
const WBTCPool = { WBTC };
const WETHPool = { WETH };
const WBNBPool = { WBNB };
const nASTRPool = { nASTR, wASTR };

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

    //=======JPYC========
    Object.values(JPYCPool).forEach(t => {
        owners_JPYC.forEach(o => toa.push([t, o]))
    })

    //=======WBTC========
    Object.values(WBTCPool).forEach(t => {
        owners_WBTC.forEach(o => toa.push([t, o]))
    })

    //=======WETH========
    Object.values(WETHPool).forEach(t => {
        owners_WETH.forEach(o => toa.push([t, o]))
    })

    //=======WBNB========
    Object.values(WBNBPool).forEach(t => {
        owners_WBNB.forEach(o => toa.push([t, o]))
    })

    //=======nASTR========
    Object.values(nASTRPool).forEach(t => {
        owners_nASTR.forEach(o => toa.push([wASTR, o]))
    })

    let balances = {};
    await sumTokens(balances, toa, block, chain);
    let balancesWithPrefixes = {};
    Object.keys(balances).forEach(k => balancesWithPrefixes[`coingecko:${k}`] = balances[k])
    return balancesWithPrefixes;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
    misrepresentedTokens: true,
    timetravel: true,
    methodology: "All locked tokens includes stable and crypto assets in Sirius's pools.",
    astar: {
        start: 1650117600, // 2022/04/16 14:00 UTC
        tvl, // tvl adapter
    },
};


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
const AvaultPoolAddress = "0xD8Bc543273B0E19eed34a295614963720c89f9e4"


const SRS = "0x9448610696659de8F72e1831d392214aE1ca4838"
const VotingEscrow = "0xc9D383f1e6E5270D77ad8e198729e237b60b6397"

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
const aBaiUsdc = '0xDBd71969aC2583A9A20Af3FB81FE9C20547f30F3'
const aDaiUsdc = '0x9914Bff0437f914549c673B34808aF6020e2B453'
const aBusdUsdc = '0x347e53263F8fb843EC605A1577eC7C8c0cAC7a58'
const aUsdtUsdc = '0x02Dac4898B2c2cA9D50fF8D6a7726166CF7bCFD0'


module.exports = {
    Chain: 'astar',
    CoinGeckoID: 'sirius-finance',
    Pools: {
        [usdPoolAddress]: [DAI, USDC, USDT, BUSD],
        [oUSDPoolAddress]: [oUSD],
        [BAIPoolAddress]: [BAI],
        [StarlayPoolAddress]: [LDAI, LUSDC, LUSDT, LBUSD],
        [JPYCPoolAddress]: [JPYC],
        [WBNBPoolAddress]: [WBNB],
        [WBTCPoolAddress]: [WBTC],
        [WETHPoolAddress]: [WETH],
        [nASTRPoolAddress]: [nASTR, wASTR],
        [AvaultPoolAddress]: [aBaiUsdc, aDaiUsdc, aBusdUsdc, aUsdtUsdc],
    },
    SRS, nASTR,
    VotingEscrow,
    AvaultPool: [aBaiUsdc, aDaiUsdc, aBusdUsdc, aUsdtUsdc]
}

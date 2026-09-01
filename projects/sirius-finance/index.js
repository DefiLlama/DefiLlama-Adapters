const { staking } = require("../helper/staking");
const ADDRESSES = require('../helper/coreAssets.json')

/*** Astar Addresses ***/
const usdPoolAddress = "0x417E9d065ee22DFB7CC6C63C403600E27627F333";
const oUSDPoolAddress = "0xD18AbE9bcedeb5A9a65439e604b0BE8db0bdB176"
const BAIPoolAddress = "0x290c7577D209c2d8DB06F377af31318cE31938fB"
const JPYCPoolAddress = "0xEd6e10Fc171f2768D9c056260b18D814035F8266"
const WBTCPoolAddress = "0xff390905269Ac30eA640dBaBdF5960D7B860f2CF"
const WETHPoolAddress = "0x46F63Ec42eFcf972FCeF2330cC22e6ED1fCEB950"
const WBNBPoolAddress = "0xA82222d8b826E6a741f6cb4bFC6002c34D32fF67"
const nASTRPoolAddress = "0xEEa640c27620D7C448AD655B6e3FB94853AC01e3"
const AvaultPoolAddress = "0xD8Bc543273B0E19eed34a295614963720c89f9e4"

const SRS = "0x9448610696659de8F72e1831d392214aE1ca4838"
const VotingEscrow = "0xc9D383f1e6E5270D77ad8e198729e237b60b6397"

const DAI = ADDRESSES.astar.DAI
const USDC = ADDRESSES.moonbeam.USDC
const USDT = ADDRESSES.astar.USDT
const BUSD = ADDRESSES.oasis.ceUSDT
const oUSD = ADDRESSES.astar.oUSD;
const BAI = ADDRESSES.astar.BAI;
const JPYC = ADDRESSES.astar.JPYC
const WBTC = ADDRESSES.astar.WBTC
const WETH = ADDRESSES.moonbeam.USDT
const WBNB = ADDRESSES.milkomeda.BNB
const nASTR = ADDRESSES.astar.nASTR
const wASTR = '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720'
const aBaiUsdc = ADDRESSES.astar.aBaiUsdc
const aDaiUsdc = ADDRESSES.astar.aDaiUsdc
const aBusdUsdc = ADDRESSES.astar.aBusdUsdc
const aUsdtUsdc = ADDRESSES.astar.aUsdtUsdc

const Pools = {
    [usdPoolAddress]: [DAI, USDC, USDT, BUSD],
    [oUSDPoolAddress]: [oUSD],
    [BAIPoolAddress]: [BAI],
    [JPYCPoolAddress]: [JPYC],
    [WBNBPoolAddress]: [WBNB],
    [WBTCPoolAddress]: [WBTC],
    [WETHPoolAddress]: [WETH],
    [nASTRPoolAddress]: [nASTR, wASTR],
    [AvaultPoolAddress]: [aBaiUsdc, aDaiUsdc, aBusdUsdc, aUsdtUsdc],
}

async function tvl(api) {
  const ownerTokens = []

  for (const [o, ts] of Object.entries(Pools))
    ownerTokens.push([ts, o])
  return api.sumTokens({ ownerTokens, })
}

module.exports = {
  methodology: "All locked tokens includes stable and crypto assets in Sirius's pools.",
  astar: {
    start: '2022-04-16', // 2022/04/16 14:00 UTC
    tvl, // tvl adapter
    staking: staking(VotingEscrow, SRS),
  },
};

const sdk = require("@defillama/sdk");
const {uniTvlExport} = require("../helper/calculateUniTvl");
const { compoundExports } = require("../helper/compound");
const { staking } = require("../helper/staking");

const factoryETH = "0xF028F723ED1D0fE01cC59973C49298AA95c57472";
const comprollerETH = "0xB5d53eC97Bed54fe4c2b77f275025c3fc132D770";
const sIETH = "0xC597F86424EEb6599Ea40f999DBB739e3Aca5d82";
const WETHEquivalent = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const factoryBSC = "0x1DaeD74ed1dD7C9Dabbe51361ac90A69d851234D";
const comprollerBSC = "0x88fEf82FDf75E32e4BC0e662d67CfcEF4838F026";
const sIBNB = "0x6Df484F552115fa7F54bE4A6D7aE2999cadB2324";
const WBNBEquivalent = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const factoryHECO = "0xC28E27870558cF22ADD83540d2126da2e4b464c2";
const comprollerHECO = "0x6Cb9d7ecf84b0d3E7704ed91046e16f9D45C00FA";
const sIHT = "0xf13d3E10DEE31b80887422c89285112Dd00ce0B5";
const WHTEquivalent = "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f";

const {tvl: ethMarketsTvl, borrowed: borrowedEth} = compoundExports(
  comprollerETH,
  "ethereum",
  sIETH,
  WETHEquivalent
)

const {tvl: bscMarketsTvl, borrowed: borrowedBsc} = compoundExports(
  comprollerBSC,
  "bsc",
  sIBNB,
  WBNBEquivalent
)

const {tvl: hecoMarketsTvl, borrowed: borrowedHeco} = compoundExports(
  comprollerHECO,
  "heco",
  sIHT,
  WHTEquivalent
)

const ethTvl = uniTvlExport(factoryETH, "ethereum");

const bscTvl = uniTvlExport(factoryBSC, "bsc");

const hecoTvl = uniTvlExport(factoryHECO, "heco");

module.exports = {
  timetravel: true,
  doublecounted: false,
  ethereum: {
    tvl: sdk.util.sumChainTvls([ethTvl,ethMarketsTvl]),
    staking: staking("0x6ed306DbA10E6c6B20BBa693892Fac21f3B91977", "0xC28E27870558cF22ADD83540d2126da2e4b464c2"),
    borrowed: borrowedEth,
  },
  bsc: {
    tvl: sdk.util.sumChainTvls([bscTvl, bscMarketsTvl]),
    borrowed: borrowedBsc,
  },
  heco: {
    tvl: sdk.util.sumChainTvls([hecoTvl,hecoMarketsTvl]),
    borrowed: borrowedHeco,
  },
  methodology:
    "We count liquidity on the Farms (LP tokens) threw Factory Contract; and on the lending markets same as compound",
};

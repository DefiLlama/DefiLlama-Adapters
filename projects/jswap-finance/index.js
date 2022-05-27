const { getChainTvl } = require('../helper/getUniSubgraphTvl')
const { masterChefExports, } = require("../helper/masterchef")

const token = "0x5fac926bf1e638944bb16fb5b787b5ba4bc85b0a";
const masterchef = "0x4e864e36bb552bd1bf7bcb71a25d8c96536af7e3";
const factory = "0xd654CbF99F2907F06c88399AE123606121247D5C"

const poolInfoABI = require('./poolInfo.json')
const tempExports = masterChefExports(masterchef, "okexchain", token, true, poolInfoABI)

const graphUrls = {
    okexchain: 'https://graph.jswap.finance/subgraphs/name/jswap-finanace/jswap-subgraph'
}
const chainTvls = getChainTvl(graphUrls, 'jswapFactories')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL counts the liquidity of Jswap DEX and staking counts the tokens and the JF in dividend pool that has been staked.',
  okexchain: {
    staking: tempExports.okexchain.staking,
    tvl: chainTvls("okexchain"),
  }
}

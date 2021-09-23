const sdk = require("@defillama/sdk");
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const BANANA_TOKEN = '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95'
const MASTER_APE = '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9'
const FACTORY_BSC = "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6";
const FACTORY_POLYGON = "0xcf083be4164828f00cae704ec15a36d711491284";

const SUBGRAPH_BSC = "https://graph2.apeswap.finance/subgraphs/name/ape-swap/apeswap-subgraph"
const SUBGRAPH_POLYGON = "https://api.thegraph.com/subgraphs/name/apeswapfinance/dex-polygon" 

async function bscTvl(timestamp, block, chainBlocks) {
  return calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks['bsc'], 'bsc', FACTORY_BSC, 0, true);
}

async function polygonTvl(timestamp, block, chainBlocks) {
  return calculateUniTvl(addr=>`polygon:${addr}`, chainBlocks['polygon'], 'polygon', FACTORY_POLYGON, 0, true);
}

async function poolsTvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const stakedBanana = sdk.api.erc20.balanceOf({
      target: BANANA_TOKEN,
      owner: MASTER_APE,
      chain: 'bsc',
      block: chainBlocks.bsc
    })
    sdk.util.sumSingleBalance(balances, 'bsc:' + BANANA_TOKEN, (await stakedBanana).output)
    return balances
}

module.exports = {
  misrepresentedTokens: true,
  bsc:{
    tvl: bscTvl,
  },
  polygon:{
    tvl: polygonTvl,
  },
  staking:{
    tvl: poolsTvl,
  },
  methodology: "TVL comes from the DEX liquidity pools, staking TVL is accounted as the banana on 0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9",
  tvl: sdk.util.sumChainTvls([polygonTvl, bscTvl])
}
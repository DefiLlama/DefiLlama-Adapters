const sdk = require("@defillama/sdk");
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const ALI_TOKEN = '0x557233E794d1a5FbCc6D26dca49147379ea5073c'
const ALI_FACTORY = "0xC7a506ab3ac668EAb6bF9eCf971433D6CFeF05D9";
const ALI_MASTER_CHEF = '0x4f7b2Be2bc3C61009e9aE520CCfc830612A10694'



async function bscTvl(timestamp, block, chainBlocks) {
  return calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks['bsc'], 'bsc', ALI_FACTORY, 0, true);
}

async function poolsTvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const stakedAli = sdk.api.erc20.balanceOf({
      target: ALI_TOKEN,
      owner: ALI_MASTER_CHEF,
      chain: 'bsc',
      block: chainBlocks.bsc
    })
    sdk.util.sumSingleBalance(balances, 'bsc:' + ALI_TOKEN, (await stakedAli).output)
    return balances
}

module.exports = {
  misrepresentedTokens: true,
  bsc:{
    tvl: bscTvl,
  },
  staking:{
    tvl: poolsTvl,
  },
  methodology: "The TVL is the total of all liquidity pools. The staking TVL is accounted as the ALI on MasterChef(0x4f7b2Be2bc3C61009e9aE520CCfc830612A10694)",
  tvl: sdk.util.sumChainTvls([bscTvl])
}
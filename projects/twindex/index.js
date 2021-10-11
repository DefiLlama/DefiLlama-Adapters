const sdk = require("@defillama/sdk");
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const TWX = '0x41171d5770c4c68686d1af042ada88a45b02f82b'
const MASTER_CHEF = '0x22A5C7376C76D2D7ddC88D314912217B20d6eEc0'
const FACTORY_BSC = "0x4E66Fda7820c53C1a2F601F84918C375205Eac3E";

async function bscTvl(timestamp, block, chainBlocks) {
  return calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks['bsc'], 'bsc', FACTORY_BSC, 0, true);
}


async function poolsTvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const stakedTWX = sdk.api.erc20.balanceOf({
      target: TWX,
      owner: MASTER_CHEF,
      chain: 'bsc',
      block: chainBlocks.bsc
    })
    sdk.util.sumSingleBalance(balances, 'bsc:' + TWX, (await stakedTWX).output)
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
  methodology: "TVL comes from the DEX liquidity pools, staking TVL is accounted as the TWX on 0x41171D5770C4c68686d1aF042Ada88a45B02f82b",
  tvl: bscTvl
}
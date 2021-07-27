const sdk = require('@defillama/sdk')
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')

const bev = "0xc7dac962c166a26038ec4bc5d0e2a3fe0ff3ce58"

async function tvl(timestamp, block, chainBlocks) {
    const bevSupply = await sdk.api.erc20.totalSupply({
        target: bev,
        block: chainBlocks.bsc,
        chain: 'bsc'
    })

  return { ['bsc:'+bev]: bevSupply.output };
}

const LPstaking = "0x986581a915f8abf4C8E21781a2c45FD4Eb21699D"
const lp = "0x5ab4dc6ec350e546103f6891299b467293c36c3e"

async function pool2(timestamp, block, chainBlocks) {
    const stakedLp = await sdk.api.erc20.balanceOf({
        target: lp,
        owner: LPstaking,
        block: chainBlocks.bsc,
        chain: 'bsc'
    })
    const balances = {}

    await unwrapUniswapLPs(balances, [{
        token: lp,
        balance: stakedLp.output
    }], chainBlocks.bsc, 'bsc', addr=>`bsc:${addr}`)

  return balances;
}

module.exports = {
  bsc: {
    tvl: tvl,
  },
  pool2:{
    tvl: pool2
  },
  tvl,
};
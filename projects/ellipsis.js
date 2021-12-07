const utils = require('./helper/utils');
const {toUSDTBalances} = require('./helper/balances');
const sdk = require('@defillama/sdk')

async function tvl() {
  var totalTvl = await utils.fetchURL('https://api.ellipsis.finance/api/getTVL')
  return toUSDTBalances(totalTvl.data.data.total);
}

const lockedSupply = {"inputs":[],"name":"lockedSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
const stakingContract = "0x4076cc26efee47825917d0fec3a79d0bb9a6bb5c"
const eps = "0xa7f552078dcc247c2684336020c03648500c6d9f"
async function staking(time, ethBlock, chainBlocks){
  const locked = await sdk.api.abi.call({
    target: stakingContract,
    block: chainBlocks.bsc,
    chain: 'bsc',
    abi: lockedSupply
  })
  return {
    ["bsc:"+eps]: locked.output
  }
}

module.exports = {
  misrepresentedTokens: true,
  bsc:{
    tvl,
    staking
  }
}

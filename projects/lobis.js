const sdk = require("@defillama/sdk")

const stakingContract = '0x3818eff63418e0a0ba3980aba5ff388b029b6d90'
const LOBI = '0xdec41db0c33f3f6f3cb615449c311ba22d418a8d'

async function staking(timestamp, ethBlock, chainBlocks) {  
  const stakedLOBI = (await sdk.api.abi.call({
      target: LOBI, 
      params: stakingContract,
      abi: 'erc20:balanceOf',
      block: ethBlock,
      chain: 'ethereum'
    })).output
  const balances = {
    [LOBI]: stakedLOBI
  }
  return balances
}

module.exports = {
  methodology: "LOBI can be staked in a staking contract.",
  ethereum: {
    staking,
    tvl: () => ({})
  },
}

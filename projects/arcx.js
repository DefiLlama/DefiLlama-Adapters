const sdk = require("@defillama/sdk")
const BigNumber = require("bignumber.js")

const stARCx = '0x9bffad7a6d5f52dbc51cae33e419793c72fd7d9d'
const stakingContract = '0x9bffad7a6d5f52dbc51cae33e419793c72fd7d9d'
const ARCx = '0x1321f1f1aa541a56c31682c57b80ecfccd9bb288'

async function staking(timestamp, ethBlock, chainBlocks) {  
  const stakedARCx = (await sdk.api.abi.call({
      target: ARCx, 
      params: stakingContract,
      abi: 'erc20:balanceOf',
      block: ethBlock,
      chain: 'ethereum'
    })).output
  const balances = {
    [ARCx]: stakedARCx
  }
  return balances
}

module.exports = {
  methodology: "ARCx can be staked in the protocol",
  ethereum: {
    staking,
    tvl: () => ({})
  },
}

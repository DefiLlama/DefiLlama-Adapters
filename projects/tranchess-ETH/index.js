const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const ETHV2Funds = [
  '0x69c53679EC1C06f3275b64C428e8Cd069a2d3966', // ETH V2 Fund (ETH mainnet)
]

async function ethereum(timestamp, blockETH, chainBlocks){
  let balances = {};

  for (const fund of ETHV2Funds) {
    const tokenUnderlying = (await sdk.api.abi.call({
      target: fund,
      abi: abi.tokenUnderlying,
      chain: 'ethereum',
      block: blockETH
    })).output

    const underlyingInFund = (await sdk.api.abi.call({
      target: fund,
      abi: abi.getTotalUnderlying,
      chain: 'ethereum',
      block: blockETH
    })).output

    sdk.util.sumSingleBalance(balances, tokenUnderlying, underlyingInFund)
  }
  
  return balances
}

module.exports = {
  methodology: `Only counts the staked ETH in ETH fund deployed on Ethereum mainnet.`,
  ethereum:{
    tvl: ethereum
  }
}
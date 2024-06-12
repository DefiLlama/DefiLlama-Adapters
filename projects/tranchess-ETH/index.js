const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const ETHV2Funds = [
  '0x69c53679EC1C06f3275b64C428e8Cd069a2d3966', // ETH V2 Fund (ETH mainnet)
]

async function ethereum(api){
  const tokens = await api.multiCall({  abi: abi.tokenUnderlying, calls: ETHV2Funds})
  const bals = await api.multiCall({  abi: abi.getTotalUnderlying, calls: ETHV2Funds})
  api.addTokens(tokens, bals)
}

module.exports = {
  methodology: `Only counts the staked ETH in ETH fund deployed on Ethereum mainnet.`,
  ethereum:{
    tvl: ethereum
  }
}
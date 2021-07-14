const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const funds = [
  '0xd6B3B86209eBb3C608f3F42Bf52818169944E402'
]

function getBSCAddress(address) {
  return `bsc:${address}`
}

async function tvl(timestamp, blockETH, chainBlocks){
  let balances = {};
  const block = chainBlocks["bsc"];
  
  for (const fund of funds) {
    const tokenUnderlying = (await sdk.api.abi.call({
      target: fund,
      abi: abi.tokenUnderlying,
      chain: 'bsc',
      block: block
    })).output
    const primaryMarketCount = Number((await sdk.api.abi.call({
      target: fund,
      abi: abi.getPrimaryMarketCount,
      chain: 'bsc',
      block: block
    })).output)

    // primaryMarket count
    for (let i = 0; i < primaryMarketCount; i++) {
      const primaryMarket = (await sdk.api.abi.call({
        target: fund,
        abi: abi.getPrimaryMarketMember,
        params: [i],
        chain: 'bsc',
        block: chainBlocks['bsc']
      })).output
      const currentCreatingUnderlying = (await sdk.api.abi.call({
          target: primaryMarket,
          abi: abi.currentCreatingUnderlying,
          chain: 'bsc',
          block: chainBlocks['bsc']
      })).output

      sdk.util.sumSingleBalance(balances, getBSCAddress(tokenUnderlying), currentCreatingUnderlying)
    }

    const btcbInFund = (await sdk.api.erc20.balanceOf({
      target: tokenUnderlying,
      owner: fund,
      chain: 'bsc',
      block: chainBlocks['bsc']
    })).output

    sdk.util.sumSingleBalance(balances, getBSCAddress(tokenUnderlying), btcbInFund)
  }
  
  return balances
}

module.exports = {
  tvl
}
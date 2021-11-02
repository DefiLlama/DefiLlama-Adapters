const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const chess = '0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6'
const votingEscrow = '0x95A2bBCD64E2859d40E2Ad1B5ba49Dc0e1Abc6C2'

const funds = [
  '0xd6B3B86209eBb3C608f3F42Bf52818169944E402', // BTC
  '0x677B7304Cb944b413D3c9aEbc4D4B5DA1A698A6B'  // ETH
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

async function staking(timestamp, block, chainBlocks) {
  let balances = {};
  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: chess,
    owner: votingEscrow,
    chain: 'bsc',
    block: chainBlocks['bsc']
  });
  sdk.util.sumSingleBalance(balances, getBSCAddress(chess), balance);

  return balances;
}

module.exports = {
  tvl: tvl,
  staking: staking
}
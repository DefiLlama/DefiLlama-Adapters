const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const chess = '0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6'
const votingEscrow = '0x95A2bBCD64E2859d40E2Ad1B5ba49Dc0e1Abc6C2'

const funds = new Map([
  ['0xd6B3B86209eBb3C608f3F42Bf52818169944E402', false],  // BTC
  ['0x677B7304Cb944b413D3c9aEbc4D4B5DA1A698A6B', false],  // ETH
  ['0x629d4562033e432B390d0808B54A82B0C4A0896B', true ],  // BNB
]);

function getBSCAddress(address) {
  return `bsc:${address}`
}

async function bsc(timestamp, blockETH, chainBlocks){
  let balances = {};
  const block = chainBlocks["bsc"];
  
  for (const [fund, isV2] of funds.entries()) {
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

    var underlyingInFund;
    if (isV2) {
      underlyingInFund = (await sdk.api.abi.call({
        target: fund,
        abi: abi.getTotalUnderlying,
        chain: 'bsc',
        block: chainBlocks['bsc']
      })).output
    } else {
      underlyingInFund = (await sdk.api.erc20.balanceOf({
        target: tokenUnderlying,
        owner: fund,
        chain: 'bsc',
        block: chainBlocks['bsc']
      })).output
    }

    sdk.util.sumSingleBalance(balances, getBSCAddress(tokenUnderlying), underlyingInFund)
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
  methodology: `Counts the underlying assets in each fund.`,
  bsc:{
    staking,
    tvl: bsc
  }
}
const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const chess = '0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6'
const votingEscrow = '0x95A2bBCD64E2859d40E2Ad1B5ba49Dc0e1Abc6C2'

const ethChess = '0xD6123271F980D966B00cA4FCa6C2c021f05e2E73'
const ethVotingEscrow = '0x3FadADF8f443A6DC1E091f14Ddf8d5046b6CF95E'

const funds = new Map([
  ['0xd6B3B86209eBb3C608f3F42Bf52818169944E402', false],  // BTC
  ['0x677B7304Cb944b413D3c9aEbc4D4B5DA1A698A6B', false],  // ETH
  ['0x629d4562033e432B390d0808B54A82B0C4A0896B', true ],  // BNB
]);

const v2Funds = [
  '0x2f40c245c66C5219e0615571a526C93883B456BB',  // BTC V2 Fund
  '0x1F18cC2b50575A71dD2EbF58793d4e661a7Ba0e0',  // ETH V2 Fund
  '0x7618f37EfE8930d5EE6da34185b3AbB750BD2a34',  // BNB V2 Fund
]

const v2Swaps = [
  '0x999DB223F0807B164b783eE33d48782cc6E06742',  // BTC V2 BISHOP Swap
  '0x87585A84E0A04b96e653de3DDA77a3Cb1fdf5B6a',  // ETH V2 BISHOP Swap
  '0x56118E49582A8FfA8e7309c58E9Cd8A7e2dDAa37',  // BNB V2 BISHOP Swap
  '0xfcF44D5EB5C4A03D03CF5B567C7CDe9B66Ba5773',  // BNB V2 QUEEN Swap
  '0x6Da3A029d0F0911C7ee36c1cEa2Ea69Fc31dd970',  // BTC USDC BISHOP Swap
  '0x09427783666Ec4173e951222ab9B3C12871400AA',  // ETH USDC BISHOP Swap
  '0xD3392699d679DFa57bC8ee71a0Ad44902C1Ab9f7',  // BNB USDC BISHOP Swap
]

const ETHV2Funds = [
  '0x811c9dD8B7B670A78d02fac592EbbE465e5dD0FA', // wstETH Fund (ETH mainnet)
]

const ETHV2Swaps = [
  '0xBA919470C7a2983fbcdA6ADC89Be9C43b8298079', // ETH V2 BISHOP Swap (ETH mainnet)
  '0xAD06a2DBd34Da8f8Cf5f85d284A5B93A2057bDb5', // wstETH SWAP (ETH mainnet)
]

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

  // ------------------------------------------- V2 ------------------------------------------------

  for (const fund of v2Funds) {
    const tokenUnderlying = (await sdk.api.abi.call({
      target: fund,
      abi: abi.tokenUnderlying,
      chain: 'bsc',
      block: chainBlocks["bsc"]
    })).output

    const underlyingInFund = (await sdk.api.abi.call({
      target: fund,
      abi: abi.getTotalUnderlying,
      chain: 'bsc',
      block: chainBlocks["bsc"]
    })).output

    sdk.util.sumSingleBalance(balances, getBSCAddress(tokenUnderlying), underlyingInFund)
  }

  for (const swap of v2Swaps) {
    const quoteAddress = (await sdk.api.abi.call({
      target: swap,
      abi: abi.quoteAddress,
      chain: 'bsc',
      block: chainBlocks["bsc"]
    })).output

    const balancesInSwap = (await sdk.api.abi.call({
      target: swap,
      abi: abi.allBalances,
      chain: 'bsc',
      block: chainBlocks["bsc"]
    })).output

    sdk.util.sumSingleBalance(balances, getBSCAddress(quoteAddress), balancesInSwap[1])
  }
  
  return balances
}

async function bscStaking(timestamp, block, chainBlocks) {
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

async function ethStaking(timestamp, blockETH, chainBlocks) {
  let balances = {};
  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: ethChess,
    owner: ethVotingEscrow,
    chain: 'ethereum',
    block: blockETH
  });
  sdk.util.sumSingleBalance(balances, ethChess, balance);

  return balances;
}

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

  for (const swap of ETHV2Swaps) {
    const quoteAddress = (await sdk.api.abi.call({
      target: swap,
      abi: abi.quoteAddress,
      chain: 'ethereum',
      block: blockETH
    })).output

    const balancesInSwap = (await sdk.api.abi.call({
      target: swap,
      abi: abi.allBalances,
      chain: 'ethereum',
      block: blockETH
    })).output

    sdk.util.sumSingleBalance(balances, quoteAddress, balancesInSwap[1])
  }
  
  return balances
}

module.exports = {
  methodology: `Counts the underlying assets in each fund.`,
  bsc:{
    staking: bscStaking,
    tvl: bsc
  },
  ethereum:{
    staking: ethStaking,
    tvl: ethereum
  }
}
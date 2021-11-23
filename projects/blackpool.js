const sdk = require("@defillama/sdk")
const BigNumber = require("bignumber.js")
const { unwrapUniswapLPs } = require("./helper/unwrapLPs");

// STAKING = xBPT staking on mainnet + LP staking on mainnet + LP staking on polygon/cometh
// xBPT staking on mainnet
const BPT_mainnet = '0x0eC9F76202a7061eB9b3a7D6B59D36215A7e37da'
const xBPT_mainnet = '0x46c5098f73fa656e82d7e9afbf3c00b32b7b1ee2'

// LP tokens staked on sushiswap (mainnet against weth)  
const sushiMasterchef = "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd"
const BPT_WETH_LP_mainnet_sushi = '0x57024267e8272618f9c5037d373043a8646507e5' 

// LP tokens staked on polygon (cometh against weth and must)
const BPT_polygon = '0x6863BD30C9e313B264657B107352bA246F8Af8e0'
const BPT_WETH_LP_cometh = '0x1f2f74bf3478ab4614e002cad1c67d3a84a5c2bd'
const BPT_MUST_LP_cometh = '0xc8978a3de5ce54e1a2fe88d2036e2cc972238126' 
const BPT_WETH_LP_staking = '0xe3ae080d6a4f1ac5ababf514f871428342135877'
const BPT_MUST_LP_staking = '0xe29544a8145978a2355e44fbac61f4748f0ecca6'

async function mainnetStaking(timestamp, ethBlock, chainBlocks) { 
  let balances = {}

  // xBPT staking
  const { output: xBPT_BPT_bal } = await sdk.api.erc20.balanceOf({
    target: BPT_mainnet,
    owner: xBPT_mainnet,
    block: ethBlock,
    chain: 'ethereum'
  })
  console.log(`BPT staked in xBPT on mainnet: ${xBPT_BPT_bal / 1e18}`)
  sdk.util.sumSingleBalance(
    balances,
    BPT_mainnet,
    xBPT_BPT_bal
  );

  // Sushiswap LP BPT/WETH staking
  const { output: BPT_WETH_LP_tokens } = await sdk.api.erc20.balanceOf({
    target: BPT_WETH_LP_mainnet_sushi,
    owner: sushiMasterchef,
    block: ethBlock, 
    chain: 'ethereum' 
  })
  const lpBalances = [{
      'token': BPT_WETH_LP_mainnet_sushi, 
      'balance': BPT_WETH_LP_tokens
  }]
  console.log('Sushiswap BPT/WETH LP staked in masterchef', BPT_WETH_LP_tokens / 1e18)
  balances = {}
  await unwrapUniswapLPs(balances, lpBalances, ethBlock);

  return balances
}

async function polygonStaking(timestamp, ethBlock, chainBlocks) { 
  const balances = {}

  const {output: lpBalances} = await sdk.api.abi.multiCall({
    calls: [
      {target: BPT_WETH_LP_cometh, params: BPT_WETH_LP_staking},
      {target: BPT_MUST_LP_cometh, params: BPT_MUST_LP_staking} 
    ],
    abi: 'erc20:balanceOf',
    block: chainBlocks['polygon'],
    chain: 'polygon'
  })
  const lpPositions = lpBalances.map(t => ({
    token: t.input.target,
    balance: t.output,
  }))
  const transform = addr => {
    if (addr.toLowerCase() === BPT_polygon.toLowerCase()) {
      return BPT_mainnet
    } else {
      return 'polygon:' + addr
    }
  }
  await unwrapUniswapLPs(balances, lpPositions, chainBlocks['polygon'], chain='polygon', transform)

  return balances
}

module.exports = {
  methodology: "TVL of BlackPool corresponds to staking which consists of xBPT staking on mainnet + LP staking on mainnet/sushiswap (BPT/WETH in masterchef) + LP staking on polygon/cometh (BPT/WETH + BPT/MUST)",
  ethereum: {
    staking: mainnetStaking,
    tvl: () => ({})
  },
  polygon: {
    staking: polygonStaking,
    tvl: () => ({})
  },
}

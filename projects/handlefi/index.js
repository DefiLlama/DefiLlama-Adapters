const sdk = require("@defillama/sdk")
const BigNumber = require("bignumber.js")
const { sumTokens, unwrapUniswapLPs } = require("../helper/unwrapLPs")
const abi = require("./abi.json");

// Arbitrum TVL
const transformArbitrumAddress = addr => `arbitrum:${addr}`
const treasuryContract = "0x5710B75A0aA37f4Da939A61bb53c519296627994"
const WETH_arbitrum = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
const treasuryTokens = [WETH_arbitrum]
// Arbitrum Staking 
const WETH_FOREX_sushi_LP = '0x9745e5cc0522827958ee3fc2c03247276d359186'
const LP_staking_contract = '0x5cdeb8ff5fd3a3361e27e491696515f1d119537a'
// Eth-mainnet TVL 
const fuse_pool_directory = '0x835482FE0532f169024d5E9410199369aAD5C77E'
const fuse_pool_ids = [72, 116]
const fxTokens = {
  aud: "0x7E141940932E3D13bfa54B224cb4a16510519308",
  eur: "0x116172B2482c5dC3E6f445C16Ac13367aC3FCd35",
  php: "0x3d147cD9aC957B2a5F968dE9d1c6B9d0872286a0",
}


// Arbitrum TVL: Retrieve tokens stored in treasury contract - only weth at the moment
// https://arbiscan.io/address/0x5710B75A0aA37f4Da939A61bb53c519296627994
async function arbitrum_tvl(timestamp, block, chainBlocks, chain) {
  const balances = {}
  await sumTokens(
    balances,
    treasuryTokens.map(t => [t, treasuryContract]),
    chainBlocks.arbitrum,
    "arbitrum",
    transformArbitrumAddress
  )
  return balances
}

// Arbitrum Staking is sushiswap LP FOREX/WETH provided to staking contract
async function arbitrum_staking(timestamp, ethBlock, chainBlocks, chain) {
  const balances = {}  
  // Sushiswap LP FOREX/WETH staking on arbitrum
  const { output: FOREX_WETH_LP_tokens } = await sdk.api.erc20.balanceOf({
    target: WETH_FOREX_sushi_LP,
    owner: LP_staking_contract,
    block: chainBlocks['arbitrum'], 
    chain: 'arbitrum' 
  })
  const lpBalances = [{
      'token': WETH_FOREX_sushi_LP, 
      'balance': FOREX_WETH_LP_tokens
  }]
  console.log('Sushiswap FOREX/WETH LP staked in masterchef', FOREX_WETH_LP_tokens / 1e18)
  await unwrapUniswapLPs(balances, lpBalances, chainBlocks['arbitrum'], 'arbitrum', transformArbitrumAddress)
  return balances
}

// Eth-mainnet TVL is locked in RariCapital Fuse pool #72 and #116
async function ethereum_tvl(timestamp, ethBlock, chainBlocks, chain) {
  const balances = {}  

  for (const fuse_pool_id of fuse_pool_ids) {
    // Get pool 72 or 116 metadata from onchain call
    const {output: pool} = await sdk.api.abi.call({
      target: fuse_pool_directory, 
      params: fuse_pool_id,
      abi: abi['rari_dir.pools'],
      block: ethBlock,
      chain: 'ethereum'
    })
    const fuse_comptroller = pool.comptroller 
    
    // Get markets from comptroller
    const {output: markets} = await sdk.api.abi.call({
      target: fuse_comptroller, 
      abi: abi['comptroller.getAllMarkets'],
      block: ethBlock,
      chain: 'ethereum'
    })

    // Get markets balances of underlying
    const [ {output: underlying},  {output: balance}] = await Promise.all([
      sdk.api.abi.multiCall({
        calls: markets.map(m => ({ target: m })),
        abi: abi['comptroller.underlying'],
        block: ethBlock,
        chain: "ethereum",
      }),
      sdk.api.abi.multiCall({
        calls: markets.map(m => ({ target: m })),
        abi: abi['comptroller.getCash'],
        block: ethBlock,
        chain: "ethereum",
      }),
    ])
    console.log(`Rari Fuse pool #${fuse_pool_id}: balances of underlying of comptroller markets`, underlying.map((t, i) => t.output + ': ' + balance[i].output))

    underlying.forEach((t, i) => {
      balances[t.output] = (new BigNumber(balances[t.output] || "0").plus(new BigNumber(balance[i].output)) ).toString(10)
    })
  }

  // Set to zero balance of fxTokens, which are not collateral but are backed by the other assets of rari pools
  for (const [key, value] of Object.entries(fxTokens)) {
    balances[value] = '0'
  }
  return balances
}

module.exports = {
  arbitrum: {
    tvl: arbitrum_tvl,
    staking: arbitrum_staking
  },
  ethereum: {
    tvl: ethereum_tvl,
  },
  methodology: `TVL on arbitrum is sum of all collateralTokens (weth only atm) provided in vaults to mint any fxTokens on arbitrum. TVL on mainnet is given by collateral provided to Rari Fuse pools #72 and #116 against WETH, FEI, DAI, USDC, USDT, FRAX for now.`,
}

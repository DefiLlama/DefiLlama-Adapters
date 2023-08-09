const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk")
const { sumTokens2 } = require("../helper/unwrapLPs")
const {pool2 } = require("../helper/pool2")
const abi = require("./abi.json");

const chain = 'arbitrum'

// Arbitrum TVL
const transformArbitrumAddress = addr => `arbitrum:${addr}`
const treasuryContract = "0x5710B75A0aA37f4Da939A61bb53c519296627994"
const WETH_arbitrum = ADDRESSES.arbitrum.WETH
const FOREX_arbitrum = "0xDb298285FE4C5410B05390cA80e8Fbe9DE1F259B"
const treasuryTokens = [WETH_arbitrum, ]
const perpsVault = "0x1785e8491e7e9d771b2A6E9E389c25265F06326A"
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

async function tvl(_, _b, {[chain]: block }) {
  const balances = await sumTokens2({ chain, block, tokensAndOwners: [
    // [WETH_arbitrum, perpsVault],
    [WETH_arbitrum, treasuryContract],
  ] })
  return balances
}

// Eth-mainnet TVL is locked in RariCapital Fuse pool #72 and #116
async function ethereum_tvl(timestamp, ethBlock, chainBlocks) {
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
    //console.log(`Rari Fuse pool #${fuse_pool_id}: balances of underlying of comptroller markets`, underlying.map((t, i) => t.output + ': ' + balance[i].output))

    underlying.forEach((t, i) => {
      sdk.util.sumSingleBalance(balances, t.output, balance[i].output)
    })
  }

  // Set to zero balance of fxTokens, which are not collateral but are backed by the other assets of rari pools
  for (const [key, value] of Object.entries(fxTokens)) {
    delete balances[value];
  }
  return balances
}

module.exports = {
  arbitrum: {
    tvl,
    pool2: pool2(LP_staking_contract, WETH_FOREX_sushi_LP, "arbitrum")
  },
  // ethereum: {
  //   tvl: ethereum_tvl,
  // },
  methodology: `TVL on arbitrum is sum of all collateralTokens (weth only atm) provided in vaults to mint any fxTokens on arbitrum. TVL on mainnet is given by collateral provided to Rari Fuse pools #72 and #116 against WETH, FEI, DAI, USDC, USDT, FRAX for now.`,
}

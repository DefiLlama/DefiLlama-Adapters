const sdk = require("@defillama/sdk");
const { sumTokensExport, sumTokens2, } = require("../helper/unwrapLPs.js");
const { tokensBare: tokens } = require("../helper/tokenMapping");
const abi = require("./abi.json");

const addressProvider = '0xcf64698aff7e5f27a11dff868af228653ba53be0'
// const contractsRegister = '0xa50d4e7d8946a7c90652339cdbd262c375d54d99'
// GEAR token: 0xba3335588d9403515223f109edc4eb7269a9ab5d

const getPoolAddrs = async (block) => {
  // Get contractsRegister from Gearbox addressProvider
  const { output: contractsRegister } = await sdk.api.abi.call({
    abi: abi['getContractsRegister'],
    target: addressProvider,
    block,
  })
  // Get gearbox pools from the contractsRegister, and underlyingToken for each pool
  const { output: pools } = await sdk.api.abi.call({
    abi: abi['getPools'],
    target: contractsRegister,
    block,
  })
  return pools
}

const tvl = async (timestamp, block) => {
  const pools = await getPoolAddrs(block)
  const { output: poolsUnderlying } = await sdk.api.abi.multiCall({
    abi: abi['underlyingToken'],
    calls: pools.map((pool) => ({ target: pool })),
    block,
  })
  const tokensAndOwners = poolsUnderlying.map(t => [t.output, t.input.target])
  const { output: totalBorrowed } = await sdk.api.abi.multiCall({
    abi: abi['totalBorrowed'],
    calls: pools.map((pool) => ({ target: pool })),
    block,
  })

  const balances = {}
  totalBorrowed.forEach(({ output }, i) => sdk.util.sumSingleBalance(balances, poolsUnderlying[i].output, output))

  return sumTokens2({ balances, tokensAndOwners, block, })
}

module.exports = {
  ethereum: {
    tvl,
    treasury: sumTokensExport({
      owner: '0x7b065Fcb0760dF0CEA8CFd144e08554F3CeA73D1',
      tokens: [
        tokens.weth,
        tokens.wbtc,
        tokens.usdc,
        tokens.dai,
        '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // wseth
      ],
    })
  },
  methodology: `Retrieve tokens locked by users on each Gearbox pool (WETH/DAI/WBTC/USDC atm) - the pools being returned by the gearbox contractsRegister`
};
const sdk = require("@defillama/sdk");
const {sumTokens} = require("../helper/unwrapLPs.js");
const abi = require("./abi.json");

// Gearbox addressProvider 0xcf64698aff7e5f27a11dff868af228653ba53be0 call getContractsRegister to get the contractsRegister
const contractsRegister = '0xa50d4e7d8946a7c90652339cdbd262c375d54d99'
// GEAR token: 0xba3335588d9403515223f109edc4eb7269a9ab5d

// Gearbox Pools
/*
const gearboxPoolsTokensAndOwners = [
    ['0x6b175474e89094c44da98b954eedeac495271d0f', '0x24946bCbBd028D5ABb62ad9B635EB1b1a67AF668'], // DAI
    ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0x86130bDD69143D8a4E5fc50bf4323D48049E98E4'], // USDC
    ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0xB03670c20F87f2169A7c4eBE35746007e9575901'], // WETH
    ['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', '0xB2A015c71c17bCAC6af36645DEad8c572bA08A08'], // WBTC
]
*/

const tvl = async (timestamp, ethBlock, chainBlocks) => {
    // Get gearbox pools from the contractsRegister, and underlyingToken for each pool
    const {output: pools} = await sdk.api.abi.call({
        abi: abi['getPools'],
        target: contractsRegister,
        ethBlock,
      })
    const {output: poolsUnderlying} = await sdk.api.abi.multiCall({
        abi: abi['underlyingToken'],
        calls: pools.map((pool) => ({ target: pool })),
        ethBlock,
      })
    const gearboxPoolsTokensAndOwners = poolsUnderlying.map(t => [t.output, t.input.target])

    // Sum pools balances
    const balances = {}
    await sumTokens(balances, gearboxPoolsTokensAndOwners, ethBlock, "ethereum")
    return balances
}

module.exports = {
  ethereum: {
    tvl,
  },
  methodology: `Retrieve tokens locked by users on each Gearbox pool (WETH/DAI/WBTC/USDC atm) - the pools being returned by the gearbox contractsRegister`
};
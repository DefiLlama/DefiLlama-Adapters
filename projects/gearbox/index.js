const sdk = require("@defillama/sdk");
const {sumTokens} = require("../helper/unwrapLPs.js");
const abi = require("./abi.json");

const addressProvider = '0xcf64698aff7e5f27a11dff868af228653ba53be0'
// const contractsRegister = '0xa50d4e7d8946a7c90652339cdbd262c375d54d99'
// GEAR token: 0xba3335588d9403515223f109edc4eb7269a9ab5d

const tvl = async (timestamp, ethBlock, chainBlocks) => {
    // Get contractsRegister from Gearbox addressProvider
    const {output: contractsRegister} = await sdk.api.abi.call({
        abi: abi['getContractsRegister'],
        target: addressProvider,
        ethBlock,
      })

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
const sdk = require("@defillama/sdk")

// Registry will be released in next sdk of Angle + graphql endpoint to come
const collaterals = {
    'dai': '0x6b175474e89094c44da98b954eedeac495271d0f', 
    'usdc': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 
}
const agEUR = {
    contract: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8', 
    stableMasterFront: '0x5adDc89785D75C86aB939E9e15bfBBb7Fc086A87',
    poolManagers: {
        'dai': '0xc9daabC677F3d1301006e723bD21C60be57a5915', // DAI
        'usdc': '0xe9f183FC656656f1F17af1F2b0dF79b8fF9ad8eD' // USDC
    }
}
const agTokens = [agEUR]


async function tvl(timestamp, block, chainBlocks) {
   // Building the api calls using the poolManager object of each agToken. Could also read the poolManager.token() but abi not yet available
    const poolManagers_calls = agTokens.map(t => {
        return Object.entries(t.poolManagers).map( ([key, value]) => ({ target: collaterals[key], params: value}))
    }).flat()
    // Call erc20:balanceOf
    let collateralBalances = await sdk.api.abi.multiCall({
        calls: poolManagers_calls,
        abi: 'erc20:balanceOf',
        block: chainBlocks['ethereum'],
        chain: 'ethereum'
    })

    // Accumulate collateral to balances
    const balances = {}
    sdk.util.sumMultiBalanceOf(balances, collateralBalances)
    return balances

    // Get ag* tokens supply and collateral ratios
    /*
    const agTokensSupply_calls = agTokens.map(token => [{target: token.contract}]) // abi: 'erc20:totalSupply' 
    const agTokensSupply_calls = agTokens.map(token => [{target: token.stableMasterFront}]) // 'erc20:getCollateralRatio'
    const agEurCollat = agTokensSupply[0].output * collateralRatio[0].output
    balances = {[EURS_substitute]: agEurCollat}
    */

}

module.exports = {
    tvl: tvl, 
    methodology: `TVL is retrieved on chain by querying balances of collaterals held by poolManagers of each agToken stablecoin. Graph endpoint soon available. Otherwise could be approximated by the totalMintedStablecoins, agToken.totalSupply multiplied by the collateral ratio, stableMaster.getCollateralRatio. `
}
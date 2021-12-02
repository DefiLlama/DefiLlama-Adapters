const sdk = require("@defillama/sdk")
const BigNumber = require("bignumber.js")
const abi = require('./abi.json');

const babController = '0xd4a5b5fcb561daf3adf86f8477555b92fba43b5f'
const babylonViewer = '0x740913FEF40720E82498D5b73A4E8C3a5D9b9d79'

async function tvl(timestamp, ethBlock, chainBlocks) { 
    const balances = {}
  
    // Get all gardens using babController contract
    let { output: gardens } = await sdk.api.abi.call({
        abi: abi['getGardens'],
        target: babController, 
        block: ethBlock, 
        chain: 'ethereum' 
    })
    // console.log('gardens (public and private)', gardens)

    // Get details of all gardens using babylonViewer contract
    const gardensDetails = await sdk.api.abi.multiCall({
        abi: abi['getGardenDetails'],
        calls: gardens.map( garden => ({
            params: garden,
            target: babylonViewer,
        })), 
        block: ethBlock, 
        chain: 'ethereum' 
    })

    for (const gardenDetails of gardensDetails.output) {
        const [gardenName, symbol, creators, reserveAsset, arr1, strategies, finalizedStrategies, voteParams, capitalArr, profits] = gardenDetails.output
        // const garden_principal = capitalArr[0]
        const garden_idle = capitalArr[9]
        // Get strategies details
        const strategiesDetails = await sdk.api.abi.multiCall({
            abi: abi['getCompleteStrategy'],
            calls: strategies.map( strategy => ({
                params: strategy,
                target: babylonViewer,
            })), 
            block: ethBlock, 
            chain: 'ethereum' 
        })
        let strategy_str = ''
        const strategies_tvl = strategiesDetails.output.map(strategyDetails => {
            const [, strategyName, strategyProps,, ] = strategyDetails.output
            const [capitalAllocated, nav] = [strategyProps[4], strategyProps[10]]
            strategy_str += `   strategy ${strategyName}: nav (tvl): ${nav / 1e18} out of capitalAllocated, : ${capitalAllocated/1e18}\n`
            return nav
        })

        const garden_tvl = strategies_tvl.reduce((acc, el) => acc.plus(BigNumber(el)), BigNumber(garden_idle))
        balances[reserveAsset] = balances[reserveAsset]? BigNumber(balances[reserveAsset]).plus(garden_tvl) : garden_tvl
        if (garden_tvl/1e18 > 10) 
            console.log(`Garden with name "${gardenName}" TVL: ${garden_tvl/1e18} of reserveAsset: ${reserveAsset} locked\n${strategy_str}-----------------------------`)
    }
    return balances
}

module.exports = {
  methodology: "TVL of Babylon corresponds to capital locked into each garden (idle capital waiting to be deployed) as well as capital deployed to each strategy of these gardens",
  ethereum: {
    staking: () => ({}),
    tvl,
  }
}

/* garden Details
(
    gardenName,
    symbol,
    creators,
    garden.reserveAsset(),
    [true, garden.privateGarden(), garden.publicStrategists(), garden.publicStewards()],
    garden.getStrategies(),
    garden.getFinalizedStrategies(),
    [
        garden.depositHardlock(),
        garden.minVotesQuorum(),
        garden.maxDepositLimit(),
        garden.minVoters(),
        garden.minStrategyDuration(),
        garden.maxStrategyDuration(),
        garden.strategyCooldownPeriod(),
        garden.minContribution(),
        garden.minLiquidityAsset(),
        garden.totalKeeperFees().add(garden.keeperDebt())
    ],
    [
        principal,
        garden.reserveAssetRewardsSetAside(),
        uint256(garden.absoluteReturns()),
        garden.gardenInitializedAt(),
        garden.totalContributors(),
        garden.totalStake(),
        totalSupplyValuationAndSeed[1] > 0
            ? totalSupplyValuationAndSeed[0].preciseMul(totalSupplyValuationAndSeed[1])
            : 0,
        totalSupplyValuationAndSeed[0],
        totalSupplyValuationAndSeed[2],
        totalSupplyValuationAndSeed[3]
    ],
    profits
)
*/
/* Complete Strategy
(
    strategist,
    strategyName,
    [
        strategy.getOperationsCount(),
        strategy.stake(),
        strategy.totalPositiveVotes(),
        strategy.totalNegativeVotes(),
        strategy.capitalAllocated(),
        strategy.capitalReturned(),
        strategy.duration(),
        strategy.expectedReturn(),
        strategy.maxCapitalRequested(),
        strategy.enteredAt(),
        strategy.getNAV(),
        rewards,
        strategy.maxAllocationPercentage(),
        strategy.maxGasFeePercentage(),
        strategy.maxTradeSlippagePercentage(),
        strategy.isStrategyActive() ? _estimateStrategyRewards(_strategy) : 0
    ],
    status,
    ts
)
*/
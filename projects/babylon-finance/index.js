const sdk = require("@defillama/sdk")
const BigNumber = require("bignumber.js")
const abi = require('./abi.json');
const { unwrapUniswapV3LPs } = require("./helper");
const { log } = require('../helper/utils')

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

    const gardensToIgnore = ["0xB0EE8C61c78aA9B7ED138bcC6bce7ABeC8470038", "0xF0AF08d7bc6e4aE42b84771aE3f9DA7D8e58b083", "0x4f5721Ce7F02586D67eA0CC6003e889E974DC9A0", "0xab051B83eecA40084855e289E2531D22F9AffD21"]
    gardens = gardens.filter(i => !gardensToIgnore.includes(i))
    // Get details of all gardens using babylonViewer contract
    const gardensDetails = await sdk.api.abi.multiCall({
        abi: abi['getGardenDetails'],
        calls: gardens.map(garden => ({
            params: garden,
            target: babylonViewer,
        })),
        block: ethBlock,
        chain: 'ethereum'
    })

    for (const gardenDetails of gardensDetails.output) {
        if (gardensToIgnore.includes(gardenDetails.input.params[0])) { continue; }
        log(gardenDetails.input.params[0], !!gardenDetails.output)
        const [gardenName, symbol, creators, reserveAsset, arr1, strategies, finalizedStrategies, voteParams, capitalArr, profits] = gardenDetails.output
        // const garden_principal = capitalArr[0]
        const garden_idle = capitalArr[9]
        // Get strategies details
        const strategiesDetails = await sdk.api.abi.multiCall({
            abi: abi['getCompleteStrategy'],
            calls: strategies.map(strategy => ({
                params: strategy,
                target: babylonViewer,
            })),
            block: ethBlock,
            chain: 'ethereum'
        })
        let strategy_str = ''
        const strategies_tvl = strategiesDetails.output.map(strategyDetails => {
            const [, strategyName, strategyProps, ,] = strategyDetails.output
            const [capitalAllocated, nav] = [strategyProps[4], strategyProps[10]]
            strategy_str += `   strategy ${strategyName}: nav (tvl): ${nav / 1e18} out of capitalAllocated, : ${capitalAllocated / 1e18}\n`
            return nav
        })

        const garden_tvl = strategies_tvl.reduce((acc, el) => acc.plus(BigNumber(el)), BigNumber(garden_idle))
        balances[reserveAsset] = balances[reserveAsset] ? BigNumber(balances[reserveAsset]).plus(garden_tvl) : garden_tvl
        if (garden_tvl / 1e18 > 10)
            log(`Garden with name "${gardenName}" TVL: ${garden_tvl / 1e18} of reserveAsset: ${reserveAsset} locked\n${strategy_str}-----------------------------`)
    }
    return Object.fromEntries(Object.entries(balances).map(b => [b[0], b[1].toFixed(0)]))
}

const harvest_vault = '0xadB16dF01b9474347E8fffD6032360D3B54627fB'
const harvest_pool = '0x3e6397E309f68805FA8Ef66A6216bD2010DdAF19'
// const harvest_position_id = 158516
async function staking(timestamp, ethBlock, chainBlocks) {
    const balances = {}
    const univ3_Positions = [{
        vault: harvest_vault,
        pool: harvest_pool
    }]
    await unwrapUniswapV3LPs(balances, univ3_Positions, ethBlock, 'ethereum')
    log('balances:', balances)
    return balances
}

module.exports = {
    methodology: "TVL of Babylon corresponds to capital locked into each garden (idle capital waiting to be deployed) as well as capital deployed to each strategy of these gardens",
    ethereum: {
        staking, // : () => ({})
        tvl // : () => ({}),
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
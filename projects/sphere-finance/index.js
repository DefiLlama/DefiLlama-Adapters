const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs")
const { treasuryExports } = require("../helper/treasury")
const sdk = require("@defillama/sdk")
const { ohmTvl } = require('../helper/ohm')

const SphereToken = "0x62f594339830b90ae4c084ae7d223ffafd9658a7"
const SphereLP = "0xf3312968c7D768C19107731100Ece7d4780b47B2" // SPHERE/MATIC LP

// adresses of gnosis safe contracts that hold the treasury funds, etc
const OptimismGnosisContract = "0x93B0a33911de79b897eb0439f223935aF5a60c24"
const ArbitrumGnosisContract = "0xA6efac6a6715CcCE780f8D9E7ea174C4d85dbE02"
const BinanceGnosisContract = "0x124E8498a25EB6407c616188632D40d80F8e50b0"
const PolygonGnosisContracts = ["0x20D61737f972EEcB0aF5f0a85ab358Cd083Dd56a", "0x1a2ce410a034424b784d4b228f167a061b94cff4", "0x826b8d2d523e7af40888754e3de64348c00b99f4"]



//Optimism TVL consists of investments/tokens on gnosis safe
async function optimismTvl(timestamp, block, chainBlocks) {
    let balances = {}

    await Promise.all([
        balanceOf(OptimismGnosisContract, "0x4200000000000000000000000000000000000006", "oeth:0x4200000000000000000000000000000000000006", balances, block, "optimism"), // Optimism ETH
        balanceOf(OptimismGnosisContract, "0x4200000000000000000000000000000000000042", "oeth:0x4200000000000000000000000000000000000042", balances, block, "optimism"), // Optimism OP
        balanceOf(OptimismGnosisContract, "0x73cb180bf0521828d8849bc8CF2B920918e23032", "oeth:0x73cb180bf0521828d8849bc8CF2B920918e23032", balances, block, "optimism"), // Optimism USD+
        balanceOf(OptimismGnosisContract, "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", "oeth:0x7F5c764cBc14f9669B88837ca1490cCa17c31607", balances, block, "optimism"), // Optimism USDC
    ]);

    return balances;
}

//Arbitrum TVL consists of investments/tokens on gnosis safe
async function arbitrumTvl(timestamp, block, chainBlocks) {
    let balances = {}

    await Promise.all([
        balanceOf(ArbitrumGnosisContract, "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", "arb1:0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", balances, block, "arbitrum"), // Arbitrum WETH
        balanceOf(ArbitrumGnosisContract, "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", "arb1:0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", balances, block, "arbitrum"), // Arbitrum GMX
        balanceOf(ArbitrumGnosisContract, "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", "arb1:0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", balances, block, "arbitrum"), // Arbitrum USDC
        balanceOf(ArbitrumGnosisContract, "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", "arb1:0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", balances, block, "arbitrum"), // Arbitrum USDT
        balanceOf(ArbitrumGnosisContract, "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", "arb1:0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", balances, block, "arbitrum"), // Arbitrum WBTC
    ]);
}

async function balanceOf(owner, target, balances, block, chain) {
    const balance = (await sdk.api.erc20.balanceOf({
        chain: chain,
        block: block,
        target: target,
        owner: owner,
    })).output;

    sdk.util.sumSingleBalance(balances, target, balance);
}

module.exports = {
    optimism: {
        tvl: optimismTvl
    },
    arbitrum: {
        tvl: arbitrumTvl
    },
}
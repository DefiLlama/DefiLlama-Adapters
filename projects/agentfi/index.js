const { tokenAddress, uniV2Lp, uniV3NftManager } = require('./ca')
const { getTvlForLooperWithOrbit } = require('./strategies/looper')
const { getTvlForDexBalancer } = require('./strategies/dex-balancer')
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const { getAllAgent } = require("./utils");


async function tvl(api) {
    const multiCallAddress = "0xcA11bde05977b3631167028862bE2a173976CA11"
    const allAgents = await getAllAgent(api)
    const allAgentsAddress = allAgents.map(i => i.agentAddress)
    const dexBalancerAgents = allAgents.filter(i => i.moduleType === "DexBalancer")
    const concentratedLiquidityAgents = allAgents.filter(i => i.moduleType === "ConcentratedLiquidity")
    const looperAgentsAddresses = allAgents.filter(i => i.moduleType === "Looper").map(i => i.agentAddress)

    const USDB = allAgentsAddress.map(ag => [tokenAddress.USDB, ag])
    const ETH = allAgentsAddress.map(ag => ({
        target: multiCallAddress, params: [ag]
    }))
    const WETH = allAgentsAddress.map(ag => [tokenAddress.WETH, ag])

    const thrusterv2 = dexBalancerAgents.map(i => [uniV2Lp.thruster, i.agentAddress])
    const blasterswapv2 = dexBalancerAgents.map(i => [uniV2Lp.blasterswap, i.agentAddress])
    const ringv2 = dexBalancerAgents.map(i => [uniV2Lp.ring, i.agentAddress])

    const blasterswapV3 = concentratedLiquidityAgents.map(i => [uniV3NftManager.blasterswap, i.agentAddress])
    const blasterswap2V3 = concentratedLiquidityAgents.map(i => [uniV3NftManager.blasterswap2, i.agentAddress])
    const thrusterV3 = concentratedLiquidityAgents.map(i => [uniV3NftManager.thruster, i.agentAddress])


    const ethBalancePromise = api.multiCall({
        abi: 'function getEthBalance(address addr) view returns (uint256 balance)',
        calls: ETH,
    })
    const dexBalancerPromise = getTvlForDexBalancer(dexBalancerAgents.map(i => i.agentAddress), api)
    const looperPromise = getTvlForLooperWithOrbit(looperAgentsAddresses, api)
    const sumTokenPromise = sumTokens2({
        tokensAndOwners: [
            ...USDB,
            ...WETH,
            ...thrusterv2,
            ...blasterswapv2,
            ...ringv2,
        ],
        uniV3nftsAndOwners: [
            ...blasterswapV3,
            ...blasterswap2V3,
            ...thrusterV3
        ],
        resolveLP: true,
        api,
    })

    const [ethBalance] = await Promise.all([ethBalancePromise, sumTokenPromise, looperPromise, dexBalancerPromise])
    ethBalance.forEach(i => api.add(nullAddress, i))
}

module.exports = {
    methodology: 'The TVL consists of the underlying capital held by all agents(ERC6551 token bound account)',
    doublecounted: true,
    blast: {
        tvl,
    }
};

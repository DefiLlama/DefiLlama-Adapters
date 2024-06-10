const { tokenAddress, uniV2Lp, uniV3NftManager } = require('./ca')
const { getTvlForLooperWithOrbit } = require('./strategies/looper')
const { getTvlForDexBalancer } = require('./strategies/dex-balancer')
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const { getAllAgent } = require("./utils");


async function tvl(api) {
    const allAgents = await getAllAgent(api)
    const allAgentsAddress = allAgents.map(i => i.agentAddress)
    const dexBalancerAgents = allAgents.filter(i => i.moduleType === "DexBalancer")
    const concentratedLiquidityAgents = allAgents.filter(i => i.moduleType === "ConcentratedLiquidity")
    const looperAgentsAddresses = allAgents.filter(i => i.moduleType === "Looper").map(i => i.agentAddress)


    const thrusterv2 = dexBalancerAgents.map(i => [uniV2Lp.thruster, i.agentAddress])
    const blasterswapv2 = dexBalancerAgents.map(i => [uniV2Lp.blasterswap, i.agentAddress])
    const ringv2 = dexBalancerAgents.map(i => [uniV2Lp.ring, i.agentAddress])

    const blasterswapV3 = concentratedLiquidityAgents.map(i => [uniV3NftManager.blasterswap, i.agentAddress])
    const blasterswap2V3 = concentratedLiquidityAgents.map(i => [uniV3NftManager.blasterswap2, i.agentAddress])
    const thrusterV3 = concentratedLiquidityAgents.map(i => [uniV3NftManager.thruster, i.agentAddress])


    await getTvlForDexBalancer(dexBalancerAgents.map(i => i.agentAddress), api)
    await  getTvlForLooperWithOrbit(looperAgentsAddresses, api)
    await sumTokens2({
        tokensAndOwners: [
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
    await api.sumTokens({ owners: allAgentsAddress, tokens: [tokenAddress.USDB, tokenAddress.WETH, nullAddress], })
}

module.exports = {
    methodology: 'The TVL consists of the underlying capital held by all agents(ERC6551 token bound account)',
    doublecounted: true,
    blast: {
        tvl,
    }
};

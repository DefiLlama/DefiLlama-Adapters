async function getTvlForBladeSwapCLM(agentAddresses, api) {
    const calls = agentAddresses.map(agent => ({
        target: agent, params: []
    }))

    const safelyGetStateOfAMMPromise = api.multiCall({
        abi: 'function safelyGetStateOfAMM() view returns (uint160 sqrtPrice, int24 tick, uint16 lastFee, uint8 pluginConfig, uint128 activeLiquidity, int24 nextTick, int24 previousTick)',
        calls: calls,
        withMetadata: true,
        permitFailure: true,
    })
    const positionPromise = api.multiCall({
        abi: 'function position() view returns (uint96 nonce, address operator, address token0, address token1, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
        calls: calls,
        withMetadata: true,
        permitFailure: true,
    })
    const [positionData, safelyGetStateOfAMMData] = await Promise.all([positionPromise, safelyGetStateOfAMMPromise])
    agentAddresses.forEach((address) => {
        const positionResult = positionData.find(b => b.input.target === address)
        const safelyGetStateOfAMMResult = safelyGetStateOfAMMData.find(b => b.input.target === address)
        if (safelyGetStateOfAMMResult.success && positionResult.success) {
            const position = positionResult.output
            const safelyGetStateOfAMM = safelyGetStateOfAMMResult.output
            const tickToPrice = (tick) => 1.0001 ** tick
            const token0 = position.token0
            const token1 = position.token1
            const liquidity = position.liquidity
            const bottomTick = +position.tickLower
            const topTick = +position.tickUpper
            const tick = safelyGetStateOfAMM.tick
            const sa = tickToPrice(bottomTick / 2)
            const sb = tickToPrice(topTick / 2)
            let amount0 = 0
            let amount1 = 0
            if (tick < bottomTick) {
                amount0 = liquidity * (sb - sa) / (sa * sb)
            } else if (tick < topTick) {
                const price = tickToPrice(tick)
                const sp = price ** 0.5

                amount0 = liquidity * (sb - sp) / (sp * sb)
                amount1 = liquidity * (sp - sa)
            } else {
                amount1 = liquidity * (sb - sa)
            }

            api.add(token0, amount0)
            api.add(token1, amount1)
        }
    })
}

module.exports = {
    getTvlForBladeSwapCLM
}

const ADDRESSES = require('../../helper/coreAssets.json')
const BigNumber = require("bignumber.js");
const { nullAddress } = require("../../helper/unwrapLPs");

async function getTvlForLooperWithOrbit(agentAddresses, api) {
    const calls = agentAddresses.map(agent => ({
        target: agent, params: []
    }))

    const borrowBalancePromise = api.multiCall({
        abi: 'function borrowBalance() view returns (uint256)',
        calls: calls,
        withMetadata: true,
        permitFailure: true,
    })
    const supplyBalancePromise = api.multiCall({
        abi: 'function supplyBalance() view returns (uint256)',
        calls: calls,
        withMetadata: true,
        permitFailure: true,
    })
    const underlyingPromise = api.multiCall({
        abi: 'function underlying() view returns (address)',
        calls: calls,
        withMetadata: true,
        permitFailure: true,
    })
    const [borrowBalance, supplyBalance, underlying] = await Promise.all([borrowBalancePromise, supplyBalancePromise, underlyingPromise])
    agentAddresses.forEach((address) => {
        const borrowBalanceResult = borrowBalance.find(b => b.input.target === address)
        const supplyBalanceResult = supplyBalance.find(b => b.input.target === address)
        const underlyingResult = underlying.find(b => b.input.target === address)
        if (borrowBalanceResult.success && supplyBalanceResult.success && underlyingResult.success) {
            const borrowBalance = borrowBalanceResult.output
            const supplyBalance = supplyBalanceResult.output
            const underlying = underlyingResult.output
            const isEth = underlying === ADDRESSES.GAS_TOKEN_2
            const tokenToAdd = isEth ? nullAddress : underlying
            api.add(tokenToAdd, BigNumber(supplyBalance).minus(borrowBalance))
        }
    })
}

module.exports = {
    getTvlForLooperWithOrbit
}

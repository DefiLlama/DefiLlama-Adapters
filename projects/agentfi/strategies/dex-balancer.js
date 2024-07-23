const ADDRESSES = require('../../helper/coreAssets.json')
const { balanceFetcher, uniV2Lp, tokenAddress } = require('../ca')
const BigNumber = require("bignumber.js");


// underlying token mapping
const RingTokenMappings = {
    // fwUSDB -> USDB
    [ADDRESSES.blast.fwUSDB]: tokenAddress.USDB,
    // fwWETH -> WETH
    [ADDRESSES.blast.fwWETH]: tokenAddress.WETH,
};

async function getTvlForDexBalancer(agentAddresses, api) {
    // fetch pool info from balanceFetcher utility function
    const ringPoolPromise = api.call({
        abi: 'function fetchPoolInfoV2(address poolAddress) public view returns (uint256 total, address address0, address address1, uint112 reserve0, uint112 reserve1)',
        target: balanceFetcher,
        params: [uniV2Lp.ring],
    })
    const thrusterPoolPromise = api.call({
        abi: 'function fetchPoolInfoV2(address poolAddress) public view returns (uint256 total, address address0, address address1, uint112 reserve0, uint112 reserve1)',
        target: balanceFetcher,
        params: [uniV2Lp.thruster],
    })

    const ringlpBalancePromise = api.multiCall({
        abi: 'function balanceOf(uint256 index, address account) returns (uint256)',
        calls: agentAddresses.map(agent => ({
            target: "0xEff87A51f5Abd015F1AFCD5737BBab450eA15A24", // ring staking contract
            params: [3, agent],
        })),
        withMetadata: true,
        permitFailure: true,
    })

    const hyperlocklpBalancePromise = api.multiCall({
        abi: 'function staked(address account, address token) returns (uint256)',
        calls: agentAddresses.map(agent => ({
            target: "0xC3EcaDB7a5faB07c72af6BcFbD588b7818c4a40e", // hyperlock staking contract
            params: [agent, "0x12c69BFA3fb3CbA75a1DEFA6e976B87E233fc7df"],
        })),
        withMetadata: true,
        permitFailure: true,
    })

    const [ringPoolData, thrusterPoolData, ringlpBalances, hyperlocklpBalances] = await Promise.all([ringPoolPromise, thrusterPoolPromise, ringlpBalancePromise, hyperlocklpBalancePromise])

    agentAddresses.forEach((address) => {
        const ringlpBalance = ringlpBalances.find(b => b.input.params[1] === address)
        if (ringlpBalance.success) {
            const lpBalance = ringlpBalance.output
            const [total, address0, address1, reserve0, reserve1] = ringPoolData;
            const lpBalanceBigN = BigNumber(lpBalance)
            const totalBigN = BigNumber(total)
            const reserve0BigN = BigNumber(reserve0)
            const reserve1BigN = BigNumber(reserve1)
            const token0Balance = lpBalanceBigN.times(reserve0BigN).div(totalBigN)
            const token1Balance = lpBalanceBigN.times(reserve1BigN).div(totalBigN)
            api.add(RingTokenMappings[address0.toLowerCase()], token0Balance.toFixed(0))
            api.add(RingTokenMappings[address1.toLowerCase()], token1Balance.toFixed(0))
        }
        const hyperlocklpBalance = hyperlocklpBalances.find(b => b.input.params[0] === address)
        if (hyperlocklpBalance.success) {
            const lpBalance = hyperlocklpBalance.output
            const [total, address0, address1, reserve0, reserve1] = thrusterPoolData;
            const lpBalanceBigN = BigNumber(lpBalance)
            const totalBigN = BigNumber(total)
            const reserve0BigN = BigNumber(reserve0)
            const reserve1BigN = BigNumber(reserve1)
            const token0Balance = lpBalanceBigN.times(reserve0BigN).div(totalBigN)
            const token1Balance = lpBalanceBigN.times(reserve1BigN).div(totalBigN)
            api.add(address0, token0Balance.toFixed(0))
            api.add(address1, token1Balance.toFixed(0))
        }
    })


}

module.exports = {
    getTvlForDexBalancer
}

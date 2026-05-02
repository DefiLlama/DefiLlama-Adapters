const START = 1773920918

// Gremlix ERC-4626 yield vaults on Arbitrum
const VAULTS = [
    '0x973Ae12aC9078E9f9B1708C477A9670bB3fB0886',
    '0xd519EF317Be061b310D3caA4565Fa1ef466c36C8',
]

async function tvl(api) {
    const [assets, totals] = await Promise.all([
        api.multiCall({abi: 'address:asset', calls: VAULTS, permitFailure: true}),
        api.multiCall({abi: 'uint256:totalAssets', calls: VAULTS, permitFailure: true}),
    ])
    assets.forEach((token, i) => {
        if (token && totals[i]) api.add(token, totals[i])
    })
}

module.exports = {
    methodology: 'TVL is the sum of total assets across all Gremlix ERC-4626 vaults.',
    start: START,
    doublecounted: true,
    arbitrum: {tvl},
}
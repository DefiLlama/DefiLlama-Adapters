// Gremlix ERC-4626 yield vaults on Arbitrum
const VAULTS = [
    '0x973Ae12aC9078E9f9B1708C477A9670bB3fB0886',
    '0xd519EF317Be061b310D3caA4565Fa1ef466c36C8',
]

async function tvl(api) {
    const assets = await api.multiCall({abi: 'address:asset', calls: VAULTS})
    const totals = await api.multiCall({abi: 'uint256:totalAssets', calls: VAULTS})
    api.addTokens(assets, totals)
}

module.exports = {
    methodology: 'TVL is the sum of total assets across all Gremlix ERC-4626 vaults.',
    arbitrum: {tvl},
}
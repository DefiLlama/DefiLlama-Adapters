const vaults = [
    { "vault": "0xc383a3833A87009fD9597F8184979AF5eDFad019", "token": "0x0000000000000000000000000000000000000000" },
    { "vault": "0xc8871267e07408b89aA5aEcc58AdCA5E574557F8", "token": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
    { "vault": "0xEC363faa5c4dd0e51f3D9B5d0101263760E7cdeB", "token": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
    { "vault": "0x40a9d39aa50871Df092538c5999b107f34409061", "token": "0x6B175474E89094C44Da98b954EedeAC495271d0F" }
]
const vaultsV2 = ["0xA0D3707c569ff8C87FA923d3823eC5D81c98Be78"]

async function tvl(api) {
    const calls = vaults.map(v => ({ target: v.vault }))
    const prices = await api.multiCall({
        calls,
        abi: "function getCurrentExchangePrice() public view returns (uint256 exchangePrice_, uint256 newTokenRevenue_)"
    })
    const supply = await api.multiCall({
        calls,
        abi: "erc20:totalSupply"
    })
    prices.forEach((price, i)=>api.add(vaults[i].token, price.exchangePrice_*supply[i]/1e18))
    return api.erc4626Sum({ calls: vaultsV2, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' });
}

module.exports = {
    ethereum: { tvl }
}
const config = require("./config");

const abi = {
    getAccountantState: 'function getAccountantState() view returns (tuple(address payoutAddress, uint96 exchangeRate, uint128 feesOwedInBase, uint128 totalSharesLastUpdate, uint64 lastUpdateTimestamp, uint16 platformFee))',
}

async function tvl(api) {
    const contracts =Object.values(config.vaults)

    const supplies = await api.multiCall({
        abi: "erc20:totalSupply",
        calls: contracts.map((c) => ({target: c.BoringVaultAddress})),
    })
    const decimals = await api.multiCall({
        abi: "erc20:decimals",
        calls: contracts.map((c) => ({target: c.BoringVaultAddress})),
    })
    const accountants = await api.multiCall({
        abi: abi.getAccountantState,
        calls: contracts.map((c) => ({target: c.AccountantAddress})),
    })

    contracts.forEach((c, index) => {
        const shares = supplies[index]
        const decimal = decimals[index]
        const exchangeRate = accountants[index].exchangeRate

        const assetSupply = (shares * exchangeRate) / (10 ** decimal)

        api.add(c.StakingToken, assetSupply)
    })
}

module.exports = {
    doublecounted: true,
    berachain: { tvl }
}
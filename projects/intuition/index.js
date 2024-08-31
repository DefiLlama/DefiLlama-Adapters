const ADDRESSES = require('../helper/coreAssets.json')

const ETHMULTIVAULT = "0x430BbF52503Bd4801E51182f4cB9f8F534225DE5"; // Intuition's EthMultiVault contract address on Base mainnet

async function tvl(api) {
    await api.sumTokens({ owners: [ETHMULTIVAULT], tokens: [ADDRESSES.null] })
    const bal = api.getBalances()
    return bal
}

module.exports = {
    methodology: "The TVL is calculated based on the current ETH balance held within Intuition's EthMultiVault contract on the Base mainnet.",
    base: {
        tvl
    }
}

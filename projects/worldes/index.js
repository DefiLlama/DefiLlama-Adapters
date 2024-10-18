
const excludedTokens = ['0x854315f8ef8db4d8fbe782863979b219e4f62f14', '0x411c5c42fba934260b2fce850aab5a4b1b783c2a', '0xceab5af10d5376016c8c352ea77f8bc6a88bda11'].map(i => i.toLowerCase())
const usdtTokenAddress = '0x665ea71a2dbbaeca044efe09d33e07c0f409d375'

async function tvl(api) {
    const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: excludedTokens })
    const prices = await api.multiCall({ abi: 'function decimals() external view returns (uint8)', calls: excludedTokens })

    supplies.forEach((v, i) => api.add(usdtTokenAddress , v / prices[i] ** 10))
}

module.exports = {
    misrepresentedTokens: true,
    arbitrum: {
        tvl,
    },
    methodology: "TVL for the  Platform is calculated by summing the values of all assets, with each asset's value determined by multiplying its token supply by its token price, where the token price is obtained from the priceOracle."
};
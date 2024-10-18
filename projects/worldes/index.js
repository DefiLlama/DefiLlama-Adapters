
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
    methodology: "WORLDES is a RWA Liquidity Yield Protocol, and is building an entry and trading platform for real world assets (RWA). WORLDES integrates blockchain, AMM, and Generative AI (GAI) technologies to tokenize real-world assets such as real estate through Real World Assets (RWA). WORLDES solves the issue of poor liquidity in traditional real estate assets, providing users with a secure, fast-trading platform for digital asset management and investment, offering potentially high returns."
};
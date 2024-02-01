const PUF_ETH = '0xD9A442856C234a39a81a089C06451EBAa4306a72';
const ETH = "0x0000000000000000000000000000000000000000";

const pufETHAbi = {
    "totalAssets": "function totalAssets() view returns (uint256)"
}

async function tvl(_, _1, _2, { api }) {
    const totalAssets = await api.call({
        abi: pufETHAbi.totalAssets,
        target: PUF_ETH,
        params: [],
    });

    // The vault holds stETH which which has 1:1 exchange rate with ETH, WETH, ETH
    // Meaning all of the assets held by the vault are ETH
    api.add(ETH, totalAssets)
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Returns the total assets owned by the Puffer Vault on Ethereum.',
    start: 19128047,
    ethereum: {
        tvl,
    }
}; 
const BigNumber = require('bignumber.js');
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances')


const abi = {
    getPoolValue: {
        "inputs": [{ "internalType": "contract IPoolForLens", "name": "_pool", "type": "address" }],
        "name": "getPoolValue",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
}

const tvl = async () => {
    const sum = {};
    const [poolValue, wrapNativeBalanceLVLNativePair, wrapNativeBalanceStableNativePair, stableBalanceStableNativePair] = await Promise.all([
        sdk.api.abi.call({
            target: "0x1f0F5b5eE986bD513cDEcFD9E25B72457aA5aD57", // pool lens
            abi: abi.getPoolValue,
            params: ["0xA5aBFB56a78D2BD4689b25B8A77fd49Bb0675874"], // Pool
            chain: 'bsc',
        }),
        sdk.api.abi.call({
            target: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
            abi: "erc20:balanceOf",
            params: ["0x70f16782010fa7ddf032a6aacdeed05ac6b0bc85"], // LVL/BNB pair
            chain: 'bsc',
        }),
        sdk.api.abi.call({
            target: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
            abi: "erc20:balanceOf",
            params: ["0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16"], // BNB/BUSD pair
            chain: 'bsc',
        }),
        sdk.api.abi.call({
            target: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
            abi: "erc20:balanceOf",
            params: ["0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16"], // BNB/BUSD pair
            chain: 'bsc',
        }),
    ]);
    const wrapNativePrice = new BigNumber(stableBalanceStableNativePair.output)
        .times(new BigNumber(10).pow(12))
        .div(new BigNumber(wrapNativeBalanceStableNativePair.output));

    const tvl = wrapNativePrice.times(wrapNativeBalanceLVLNativePair.output).plus(new BigNumber(poolValue.output)).div(new BigNumber(10).pow(30));
    return toUSDTBalances(tvl)
}

module.exports = {
    bsc: {
        tvl,
    },
};
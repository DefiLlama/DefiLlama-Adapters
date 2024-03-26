const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens } = require('../helper/sumTokens');

const fusionLockContract = "0x61dc14b28d4dbcd6cf887e9b72018b9da1ce6ff7";
const totalDepositsAbi = "function totalDeposits(address) external view returns (uint256)";

const enabledAddresses = [
    ADDRESSES.null, // ETH
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.WBTC,
    ADDRESSES.ethereum.tBTC,
    ADDRESSES.ethereum.RETH,
    ADDRESSES.ethereum.WSTETH,
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.DAI,
    "0x7122985656e38BDC0302Db86685bb972b145bD3C", // STONE
    "0xbdBb63F938c8961AF31eaD3deBa5C96e6A323DD1", // eDLLR
    "0xbdab72602e9AD40FC6a6852CAf43258113B8F7a5", // eSOV
    "0xe7c3755482d0dA522678Af05945062d4427e0923", // ALEX
];

async function tvl(_, _a, _b, {api}) {
    const calls = enabledAddresses.map((address) => ({
        target: fusionLockContract,
        params: [address]
    }));

    const totalDepositsResults = await api.multiCall({
        calls,
        abi: totalDepositsAbi,
    });

    const balances = {};

    totalDepositsResults.forEach((amount, idx) => {
        // assuming multiCall respects call order
        const address = enabledAddresses[idx];
        balances[address] = amount;
    });

    await sumTokens({
        api,
        balances,
        tokens: enabledAddresses,
    });

    return balances;
}

module.exports = {
    ethereum: {tvl}
}

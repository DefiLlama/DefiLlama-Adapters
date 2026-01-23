const vaultFactoryABI = {
    getNumberOfVaults: "function getNumberOfVaults(uint8) view returns (uint256)",
    getVaultAt: "function getVaultAt(uint8,uint256) view returns (address)",
};

const vaultABI = {
    getBalances: "function getBalances() view returns (uint256 amountX, uint256 amountY)",
    getTokenX: "function getTokenX() view returns (address)",
    getTokenY: "function getTokenY() view returns (address)",
};

// Supported chains
const chains = {
    megaeth: 4326,
};

const FACTORIES = {
    megaeth: "0x958E7D2eDaeE6A0CcF928a40c386b655A7008243",
};

async function tvl(api) {
    const chain = api.chain;
    const factory = FACTORIES[chain];
    if (!factory) return api.getBalances();

    const numVaults = await api.call({
        target: factory,
        abi: vaultFactoryABI.getNumberOfVaults,
        params: [2],
    });
    const totalVaults = Number(numVaults || 0);
    if (!totalVaults) return api.getBalances();

    const vaults = await api.multiCall({
        target: factory,
        abi: vaultFactoryABI.getVaultAt,
        calls: Array.from({length: totalVaults}, (_, i) => ({params: [2, i]})),
    });
    const vaultAddresses = vaults.filter(Boolean);
    if (!vaultAddresses.length) return api.getBalances();

    const [tokenXs, tokenYs, balances] = await Promise.all([
        api.multiCall({abi: vaultABI.getTokenX, calls: vaultAddresses, permitFailure: true}),
        api.multiCall({abi: vaultABI.getTokenY, calls: vaultAddresses, permitFailure: true}),
        api.multiCall({abi: vaultABI.getBalances, calls: vaultAddresses, permitFailure: true}),
    ]);

    balances.forEach((vaultBalances, i) => {
        if (!vaultBalances) return;
        const amountX = vaultBalances.amountX ?? vaultBalances[0];
        const amountY = vaultBalances.amountY ?? vaultBalances[1];
        const tokenX = tokenXs[i];
        const tokenY = tokenYs[i];
        if (tokenX && amountX) api.add(tokenX, amountX);
        if (tokenY && amountY) api.add(tokenY, amountY);
    });

    return api.getBalances();
}

module.exports = {
    misrepresentedTokens: true,
    methodology: 'Provides the current and live total value locked of each Sectorone vault, which is the sum of the current market capitalisation of all of the assets currently held by the relevant vault, denominated in $USD. Fetches vault addresses from the chain directly, then queries actual onchain balances of underlying tokens in each vault contract.',
};

Object.keys(chains).forEach(chain =>
    module.exports[chain] = {tvl: (api) => tvl(api)}
)
const vaultFactoryABI = {
    getNumberOfVaults: "function getNumberOfVaults(uint8) view returns (uint256)",
    getVaultAt: "function getVaultAt(uint8,uint256) view returns (address)",
};

const vaultABI = {
    getBalances: "function getBalances() view returns (uint256 amountX, uint256 amountY)",
    getTokenX: "function getTokenX() view returns (address)",
    getTokenY: "function getTokenY() view returns (address)",
};

const FACTORIES = {
    megaeth: "0x958E7D2eDaeE6A0CcF928a40c386b655A7008243",
};

async function tvl(api) {
    const chain = api.chain;
    const factory = FACTORIES[chain];

    const numVaults = await api.call({ target: factory, abi: vaultFactoryABI.getNumberOfVaults, params: [2], });

    const vaults = await api.multiCall({
        target: factory,
        abi: vaultFactoryABI.getVaultAt,
        calls: Array.from({ length: numVaults }, (_, i) => ({ params: [2, i] })),
    });

    const [tokenXs, tokenYs, balances] = await Promise.all([
        api.multiCall({ abi: vaultABI.getTokenX, calls: vaults, }),
        api.multiCall({ abi: vaultABI.getTokenY, calls: vaults, }),
        api.multiCall({ abi: vaultABI.getBalances, calls: vaults, }),
    ]);

    balances.forEach((vaultBalances, i) => {
        api.add(tokenXs[i], vaultBalances.amountX);
        api.add(tokenYs[i], vaultBalances.amountY);
    })
}


module.exports = {
    doublecounted: true,
    methodology: 'Provides the current and live total value locked of each Sectorone vault, which is the sum of the current market capitalisation of all of the assets currently held by the relevant vault, denominated in $USD. Fetches vault addresses from the chain directly, then queries actual onchain balances of underlying tokens in each vault contract.',
};

Object.keys(FACTORIES).forEach(chain =>
    module.exports[chain] = { tvl }
)
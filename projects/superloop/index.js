const CONFIGS = require("./config");

const reserveTokensAbi = "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)";

async function getVaultTokens(api, config, vault, tokenType) {
    const tokens = config.VAULT_TOKENS[vault][tokenType];
    const reserveAddresses = await api.multiCall({
        abi: reserveTokensAbi,
        target: config.SUPERLEND_PROTOCOL_DATA_PROVIDER,
        calls: tokens.map(token => ({ params: [token] })),
    });
    return tokenType === 'lend'
        ? reserveAddresses.map(r => r.aTokenAddress)
        : reserveAddresses.map(r => r.variableDebtTokenAddress);
}

async function tvl(api) {
    const config = CONFIGS[api.chain];

    for (let i = 0; i < config.VAULTS.length; i++) {
        const vault = (!api.block || api.block > config.MIGRATION_BLOCKS[i]) ? config.VAULTS[i] : config.V1_VAULTS[i];
        const aTokens = await getVaultTokens(api, config, vault, 'lend');
        await api.sumTokens({ tokens: [...aTokens, ...config.UNDERLYING_TOKENS], owners: [vault] });
    }
}

async function borrowed(api) {
    const config = CONFIGS[api.chain];

    for (let i = 0; i < config.VAULTS.length; i++) {
        const vault = (!api.block || api.block > config.MIGRATION_BLOCKS[i]) ? config.VAULTS[i] : config.V1_VAULTS[i];
        const { borrow } = config.VAULT_TOKENS[vault];
        const debtTokens = await getVaultTokens(api, config, vault, 'borrow');
        const debts = await api.multiCall({ abi: 'erc20:balanceOf', calls: debtTokens.map(t => ({ target: t, params: [vault] })) });
        api.add(borrow, debts);
    }
}

module.exports = {
    misrepresentedTokens: true,
    etlk: { tvl, borrowed },
    ethereum: { tvl, borrowed },
}

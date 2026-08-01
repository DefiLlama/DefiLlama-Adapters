const ADDRESSES = require('../helper/coreAssets.json')
const CONFIGS = {
    'etlk' : {
        'V1_VAULTS' : ['0xe24e5deba01ab0b5d78a0093442de0864832803e','0xc557529dd252e5a02e6c653b0b88984afa3c8199'],
        'VAULTS' : ['0xdd160351c9b75ac2984b5e11367e06ab25ee49eb','0xe6da0bb72a818ed519edb51717b86077464f0857'],
        'UNDERLYING_TOKENS' : [ADDRESSES.etlk.WXTZ, ADDRESSES.etlk.WBTC],
        'MIGRATION_BLOCKS' : [29421087, 29426956],
        'SUPERLEND_PROTOCOL_DATA_PROVIDER': "0x99e8269dDD5c7Af0F1B3973A591b47E8E001BCac",
        'VAULT_TOKENS' : {
            '0xe24e5deba01ab0b5d78a0093442de0864832803e' : {
                "lend" : [ADDRESSES.etlk.STXTZ],
                "borrow" : [ADDRESSES.etlk.WXTZ],
            },
            '0xc557529dd252e5a02e6c653b0b88984afa3c8199' : {
                "lend" : [ADDRESSES.etlk.LBTC],
                "borrow" : [ADDRESSES.etlk.WBTC],
            },
            '0xdd160351c9b75ac2984b5e11367e06ab25ee49eb' : {
                "lend" : [ADDRESSES.etlk.STXTZ],
                "borrow" : [ADDRESSES.etlk.WXTZ],
            },
            '0xe6da0bb72a818ed519edb51717b86077464f0857' : {
                "lend" : [ADDRESSES.etlk.LBTC],
                "borrow" : [ADDRESSES.etlk.WBTC],
            }
        }
    },
    "ethereum" : {
        'V1_VAULTS' : ['0x86a849d858c525b0a37ea9605bab228bc877cb0f'],
        'VAULTS' : ['0x86a849d858c525b0a37ea9605bab228bc877cb0f'],
        'MIGRATION_BLOCKS' : [0],
        'SUPERLEND_PROTOCOL_DATA_PROVIDER': "0x0a16f2fcc0d44fae41cc54e079281d84a363becd",
        'UNDERLYING_TOKENS' : [ADDRESSES.ethereum.USDe],
        'VAULT_TOKENS' : {
            '0x86a849d858c525b0a37ea9605bab228bc877cb0f' : {
                "lend" : [ADDRESSES.ethereum.USDe, ADDRESSES.ethereum.sUSDe],
                "borrow" : [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT],
            },
        }
    }
};

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

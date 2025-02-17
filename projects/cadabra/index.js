const {getLogs} = require("../helper/cache/getLogs");
const {normalizeAddress} = require("../helper/tokenMapping");

const BSC_VAULT = '0x6f24f5EB8f50DE36C1D1FEcD31c423e1fc8ba4ae';
const BSC_FROM_BLOCK = 45524968;
const BSC_ABRA_USDT_POOL = '0xa3AdcaaF941a01Eec47655c550dD5504637d029A';
const BSC_ABRA = '0xcA1c644704feBf4ab81f85daca488d1623C28e63';
const BSC_USDT = '0x55d398326f99059fF775485246999027B3197955';

const ARBITRUM_VAULT = '0x31206FFb663651aBe29cCb72aD213d5F95BdaC45';
const ARBITRUM_FROM_BLOCK = 293021794;

async function bscTvl(api) {
    const usdtBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: BSC_USDT,
        params: [BSC_ABRA_USDT_POOL],
    });

    api.add(BSC_USDT, usdtBalance)

    const abraBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: BSC_ABRA,
        params: [BSC_ABRA_USDT_POOL],
    });

    api.add(BSC_ABRA, abraBalance)

    let strategiesFunc = strategiesTvl(BSC_VAULT, BSC_FROM_BLOCK)
    await strategiesFunc(api)
}

function strategiesTvl(vault, fromBlock, { blacklistedTokens = [], preLogTokens = [], onlyUseExistingCache, permitFailure } = {}) {
    return async (api) => {
        const logs = await getLogs({
            api,
            target: vault,
            topics: ['0x3c13bc30b8e878c53fd2a36b679409c073afd75950be43d8858768e956fbc20e'],
            fromBlock,
            eventAbi: 'event PoolRegistered(bytes32 indexed poolId, address indexed poolAddress, uint8 specialization)',
            onlyArgs: true,
            extraKey: 'PoolRegistered',
            onlyUseExistingCache,
        })
        const logs2 = await getLogs({
            api,
            target: vault,
            topics: ['0xf5847d3f2197b16cdcd2098ec95d0905cd1abdaf415f07bb7cef2bba8ac5dec4'],
            fromBlock,
            eventAbi: 'event TokensRegistered(bytes32 indexed poolId, address[] tokens, address[] assetManagers)',
            onlyArgs: true,
            extraKey: 'TokensRegistered',
            onlyUseExistingCache,
        })

        let tokens = logs2.map(i => i.tokens).flat()
        tokens.push(...preLogTokens)
        const pools = logs.map(i => i.poolAddress)
        blacklistedTokens = [...blacklistedTokens, ...pools]
        blacklistedTokens = blacklistedTokens.map(t => normalizeAddress(t, api.chain))
        tokens = tokens.map(t => normalizeAddress(t, api.chain)).filter(t => !blacklistedTokens.includes(t))

        for (const t of tokens) {
            await addWrapperReserves(api, t)
        }
    }
}

/**
 * Cadabra is a yield aggregator that channels user liquidity into third-party protocols.
 * Because each protocol handles tokens differently—such as issuing A-tokens when depositing into AAVE—we calculate
 * token balances based on how each wrapper contract represents them. These wrappers abstract the underlying protocols
 * and display token balances in their base form; for example, a wrapper holding AAVE's aUSDC reports its reserves as
 * USDC.
 */
async function addWrapperReserves(api, wrapper) {
    const [tokens, amounts] = await api.call({
        abi: 'function reserves() view returns(address[] memory, uint256[] memory)',
        target: wrapper
    });

    tokens.forEach((t, i) => api.add(t, amounts[i]))
}

module.exports = {
    methodology: `The TVL is calculated by summing all underlying reserves across our strategies`,
    doublecounted: true,
    bsc: {
        tvl: bscTvl
    },
    arbitrum: {
        tvl: strategiesTvl(ARBITRUM_VAULT, ARBITRUM_FROM_BLOCK)
    }
};

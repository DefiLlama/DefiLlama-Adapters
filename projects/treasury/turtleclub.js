const {
    tokens,
    treasuryMultisigs,
    treasuryNFTs,
    defaultTokens,
    tokenMappingERC20,
    tokenMapping,
    ownTokens,
} = require('../TurtleClub/assets');
const { sumTokens2, unwrapSolidlyVeNft } = require('../helper/unwrapLPs');
const SOLIDLY_VE_NFT_ABI = require('../helper/abis/solidlyVeNft.json');
const { createIncrementArray } = require('../helper/utils');

const BALANCE_OF_NFT = 'function balanceOfNFT(uint256) returns (uint256)';
const STAKED_XREX = '0xedd7cbc9c47547d0b552d5bc2be76135f49c15b1';

const getTreasuryOwners = () => treasuryMultisigs;
const nonZero = balance => balance && balance !== '0';
const normalizeBalances = balances => balances.filter(nonZero).map(Number);

const addMappedBalance = (api, { token, coingeckoId, decimals }, balance) => {
    if (coingeckoId) return api.add(coingeckoId, balance / (10 ** decimals), { skipChain: true });
    return api.add(token, balance);
};

async function sumNFTs(api, NFTs) {
    const nftBalanceCalls = NFTs.map(async treasuryNFT => {
        const { veNft, owner, baseToken, useLocked = true } = treasuryNFT;

        if (useLocked) return unwrapSolidlyVeNft({ api, isAltAbi: true, veNft, owner, baseToken });

        const count = await api.call({ abi: 'erc20:balanceOf', target: veNft, params: owner });
        const tokenIds = await api.multiCall({
            abi: SOLIDLY_VE_NFT_ABI.tokenOfOwnerByIndex,
            calls: createIncrementArray(count).map(i => ({ params: [owner, i] })),
            target: veNft,
        });
        const balances = await api.multiCall({ abi: BALANCE_OF_NFT, calls: tokenIds, target: veNft });
        balances.forEach(balance => api.add(baseToken, balance));
    });

    return Promise.allSettled(nftBalanceCalls);
}

function buildTreasuryConfig(chain, tokenList) {
    const protocolOwnedTokens = ownTokens[chain] ?? [];
    const config = {
        owners: getTreasuryOwners(),
        tokens: Object.values(tokenList),
        ownTokens: protocolOwnedTokens,
        permitFailure: true,
    };

    if (defaultTokens[chain]) config.tokens = [config.tokens, defaultTokens[chain]].flat();

    return {
        ...config,
        blacklistedTokens: [...protocolOwnedTokens],
    };
}

async function sumMappedERC20s(api, chain) {
    const mappings = tokenMappingERC20[chain] ?? [];

    await Promise.allSettled(mappings.map(async ({ token, use, coingeckoId, decimals }) => {
        const balances = await api.multiCall({
            abi: 'erc20:balanceOf',
            calls: getTreasuryOwners().map(owner => ({
                target: token,
                params: owner,
            })),
            permitFailure: true,
        });

        normalizeBalances(balances).forEach(balance => {
            addMappedBalance(api, { token: use, coingeckoId, decimals }, balance);
        });
    }));
}

async function sumStakedXRex(api, chain) {
    if (chain !== 'linea') return;

    const xRex = tokens.linea.xREX;
    const xRexMapping = tokenMapping.linea[xRex];
    const balances = await api.multiCall({
        abi: 'function balanceOf(address) view returns (uint256)',
        calls: getTreasuryOwners().map(owner => ({ params: [owner] })),
        target: STAKED_XREX,
        permitFailure: true,
    });

    normalizeBalances(balances).forEach(balance => {
        addMappedBalance(api, { token: xRex, ...xRexMapping }, balance);
    });
}

function buildTvlExport(chain, config) {
    return async api => {
        await sumMappedERC20s(api, chain);
        await sumStakedXRex(api, chain);
        await sumTokens2({ api, ...config });

        if (treasuryNFTs[chain]?.length > 0) await sumNFTs(api, treasuryNFTs[chain]);
    };
}

function buildOwnTokensExport(config) {
    if (!config.ownTokens.length) return undefined;

    return api => sumTokens2({
        api,
        owners: config.owners,
        tokens: config.ownTokens,
        permitFailure: true,
    });
}

function turtleTreasuryExports() {
    const exportObj = {};

    for (const [chain, tokenList] of Object.entries(tokens)) {
        const config = buildTreasuryConfig(chain, tokenList);
        const chainExports = { tvl: buildTvlExport(chain, config) };
        const ownTokensExport = buildOwnTokensExport(config);

        if (ownTokensExport) chainExports.ownTokens = ownTokensExport;
        exportObj[chain] = chainExports;
    }

    return exportObj;
}

module.exports = turtleTreasuryExports();

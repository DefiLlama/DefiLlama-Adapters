const { tokens, treasuryMultisigs, treasuryNFTs, defaultTokens, exceptions } = require('../TurtleClub/assets');
const { ankrChainMapping } = require('../helper/token');
const { sumTokens2, unwrapSolidlyVeNft } = require('../helper/unwrapLPs');
const SOLIDLY_VE_NFT_ABI = require('../helper/abis/solidlyVeNft.json');
const { createIncrementArray } = require('../helper/utils');
const balanceOfNft_erc721 = 'function balanceOfNFT(uint256) returns (uint256)';

function formatForTreasuryExport(tokens = {}) {
    const treasuryExportsFormat = {};
    for (const [chain, tokenList] of Object.entries(tokens)) {
        treasuryExportsFormat[chain] = { owners: treasuryMultisigs, tokens: Object.values(tokenList) };
    }
    return treasuryExportsFormat;
}

async function sumPositions(api, NFTs) {
    const waitNFTs = [];
    for (const treasuryNFT of NFTs) {
        const { veNft, owner, baseToken, useLocked = true } = treasuryNFT;

        waitNFTs.push((async () => {
            if (useLocked) await unwrapSolidlyVeNft({ api, isAltAbi: true, veNft, owner, baseToken });
            else {
                const count = await api.call({ abi: 'erc20:balanceOf', target: veNft, params: owner });
                const tokenIds = await api.multiCall({ abi: SOLIDLY_VE_NFT_ABI.tokenOfOwnerByIndex, calls: createIncrementArray(count).map(i => ({ params: [owner, i] })), target: veNft });
                const bals = await api.multiCall({ abi: balanceOfNft_erc721, calls: tokenIds, target: veNft });
                bals.forEach(i => api.add(baseToken, i));
            }
        })());
    }
    return await Promise.allSettled(waitNFTs);
}

function turtleTreasuryExports(config, treasuryNFTs) {
    const chains = Object.keys(config);
    const exportObj = {};
    for (const chain of chains) {
        // From treasuryExports
        const tvlConfig = { permitFailure: true, ...config[chain] };
        if (config[chain].fetchCoValentTokens !== false) {
            if (ankrChainMapping[chain]) {
                tvlConfig.fetchCoValentTokens = true;
                const { tokenConfig } = config[chain];
                if (!tokenConfig) {
                    tvlConfig.tokenConfig = { onlyWhitelisted: false, };
                }
            } else if (defaultTokens[chain]) {
                tvlConfig.tokens = [tvlConfig.tokens, defaultTokens[chain]].flat();
            }
        }

        const tvl = async (api) => {
            if (exceptions[chain]?.length > 0) {
                const es = [];
                exceptions[chain].forEach(async ({ token, use }) => {
                    es.push((async () => {
                        const balances = await api.multiCall({
                            abi: 'erc20:balanceOf',
                            calls: treasuryMultisigs.map(owner => ({
                                target: token,
                                params: owner,
                            })),
                            permitFailure: true
                        });
                        balances.filter(b => b !== '0' && !!b).forEach(bal => api.add(use, bal));
                    })());
                });
                await Promise.allSettled(es);
            }

            await sumTokens2({ ...api, api, ...tvlConfig });
            if (treasuryNFTs[chain]?.length > 0) await sumPositions(api, treasuryNFTs[chain]);
        };
        exportObj[chain] = { tvl };
    }
    return exportObj;
}

module.exports = turtleTreasuryExports(formatForTreasuryExport(tokens), treasuryNFTs);

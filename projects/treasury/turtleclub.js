const { tokens, treasuryMultisigs, treasuryNFTs, defaultTokens, tokenMappingERC20, tokenMapping } = require('../TurtleClub/assets');
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

async function sumNFTs(api, NFTs) {
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
            if (tokenMappingERC20[chain]?.length > 0) {
                const es = [];
                tokenMappingERC20[chain].forEach(async ({ token, use, coingeckoId, decimals }) => {
                    const balanceLogic = coingeckoId ?
                        bal => api.add(coingeckoId, bal / (10 ** decimals), { skipChain: true }) :
                        bal => api.add(use, bal);
                    es.push((async () => {
                        const balances = await api.multiCall({
                            abi: 'erc20:balanceOf',
                            calls: treasuryMultisigs.map(owner => ({
                                target: token,
                                params: owner,
                            })),
                            permitFailure: true
                        });
                        balances.filter(b => b !== '0' && !!b).map(bal => Number(bal)).forEach(balanceLogic);
                    })());
                });
                await Promise.allSettled(es);
            }

            const xRexAddr = tokens.linea.xREX;
            const xRexStakedBalances = await api.multiCall({
                abi: 'function balanceOf(address) view returns (uint256)',
                calls: treasuryMultisigs.map(owner => ({ params: [owner] })),
                target: '0xedd7cbc9c47547d0b552d5bc2be76135f49c15b1', // VoteModule staking contract
                permitFailure: true,
            });
            xRexStakedBalances.filter(b => b && b !== '0').map(bal => Number(bal)).forEach(balance => {
                const xRexMapping = tokenMapping.linea[xRexAddr];
                if (xRexMapping)
                    api.add(xRexMapping.coingeckoId, balance / (10 ** xRexMapping.decimals), { skipChain: true });
                else
                    api.add(xRexAddr, balance);
            });

            await sumTokens2({ ...api, api, ...tvlConfig });
            if (treasuryNFTs[chain]?.length > 0) await sumNFTs(api, treasuryNFTs[chain]);
        };
        exportObj[chain] = { tvl };
    }
    return exportObj;
}

module.exports = turtleTreasuryExports(formatForTreasuryExport(tokens), treasuryNFTs);

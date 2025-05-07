const { tokens, treasuryMultisigs, treasuryNFTs, defaultTokens } = require('../TurtleClub/assets');
const { ankrChainMapping } = require('../helper/token');
const { sumTokens2, unwrapSolidlyVeNft } = require('../helper/unwrapLPs');

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
        waitNFTs.push(unwrapSolidlyVeNft({ api, isAltAbi: true, ...treasuryNFT }));
    }
    await Promise.allSettled(waitNFTs);
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
            await sumTokens2({ ...api, api, ...tvlConfig });
            if (treasuryNFTs[chain]?.length > 0) await sumPositions(api, treasuryNFTs[chain]);
        };
        exportObj[chain] = { tvl };
    }
    return exportObj;
}

module.exports = turtleTreasuryExports(formatForTreasuryExport(tokens), treasuryNFTs);

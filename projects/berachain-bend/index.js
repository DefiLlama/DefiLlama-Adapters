const { berachain } = require("../beracana");
const abi = require("../helper/abis/berachain-bend.json");
const { graphQuery } = require("../helper/http");
const { sumTokens2 } = require('../helper/unwrapLPs')

const MORPHO_BLUE_ADDRESS = "0x24147243f9c08d835C218Cda1e135f8dFD0517D0";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000"

const BERACHAIN_API = "https://api.berachain.com";

const getWhitelistedVaults = async (api) => {
    try {
        const data = await graphQuery(BERACHAIN_API, `
            {
                polGetRewardVaults(where: {protocolsIn: ["Bend"], includeNonWhitelisted: false}) {
                    vaults {
                        stakingTokenAddress
                    }
                }
            }
        `);
        return data.polGetRewardVaults.vaults.map(v => v.stakingTokenAddress);
    } catch {}
    return [];
}

const getMarketFromWhitelistedVaults = async (api) => {
    const whitelistedVaults = await getWhitelistedVaults();


    const withdrawQueueLengths = await api.multiCall({ calls: whitelistedVaults, abi: abi.metaMorphoFunctions.withdrawQueueLength })

    const marketResults = await Promise.all(
        withdrawQueueLengths.map(async (len, idx) => {
            const withdrawQueueIdxs = [...Array(Number(len)).keys()];

            const a = await api.multiCall({
                target: whitelistedVaults[idx],
                calls: withdrawQueueIdxs,
                abi: abi.metaMorphoFunctions.withdrawQueue
            });

            return a;
        })
    );

    const flattened = marketResults.flat();
    const markets = [...new Set(flattened)];

    return markets;

}

const tvl = async (api) => {
    const markets = await getMarketFromWhitelistedVaults(api)
    const marketInfos = await api.multiCall({ target: MORPHO_BLUE_ADDRESS, calls: markets, abi: abi.morphoBlueFunctions.idToMarketParams })
    const tokens = [...new Set(marketInfos.flatMap(({ collateralToken, loanToken }) => [collateralToken, loanToken]))].filter((token => token != NULL_ADDRESS))
    return sumTokens2({ api, owner: MORPHO_BLUE_ADDRESS, tokens, chain: berachain })
}

const borrowed = async (api) => {
    const markets = await getMarketFromWhitelistedVaults(api)
    const marketInfos = await api.multiCall({ target: MORPHO_BLUE_ADDRESS, calls: markets, abi: abi.morphoBlueFunctions.idToMarketParams })
    const marketDatas = await api.multiCall({ target: MORPHO_BLUE_ADDRESS, calls: markets, abi: abi.morphoBlueFunctions.market })

    marketDatas.forEach((data, idx) => {
        const { _, loanToken } = marketInfos[idx];
        api.add(loanToken, data.totalBorrowAssets);
    });
}

module.exports = {
    berachain: {
        tvl, borrowed
    }
};
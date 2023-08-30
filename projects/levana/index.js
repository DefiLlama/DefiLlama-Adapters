const {endPoints, queryContract} = require('../helper/chain/cosmos')
const axios = require("axios");

const osmosisChain = 'osmosis';
const seiChain = 'sei';
const osmosisFactory = 'osmo1ssw6x553kzqher0earlkwlxasfm2stnl3ms3ma2zz4tnajxyyaaqlucd45';
const seiFactory = 'sei18rdj3asllguwr6lnyu2sw8p8nut0shuj3sme27ndvvw4gakjnjqqper95h';

async function tvl(chain, factory, api) {
    // Get a list of marketIds from the factory contract
    // Iterate over the markets and request the balance of each market's collateral token

    const marketIds = await getMarketIds(chain, factory);

    for (const marketId of marketIds) {
        const marketAddr = await getMarketAddr(chain, factory, marketId);
        const marketStatus = await getMarketStatus(chain, marketAddr);
        const denom = marketStatus.collateral.native.denom;

        if (denom === undefined) {
            throw new Error('non-native tokens are not supported')
        }

        const balance = await getBalance(chain, marketAddr, denom);
        api.add(balance.denom, balance.amount);
    }
}

async function osmosisTvl(_, _1, _2,  { api }) {
    await tvl(osmosisChain, osmosisFactory, api)
}

async function seiTvl(_, _1, _2,  { api }) {
    await tvl(seiChain, seiFactory, api)
}

async function getMarketIds(chain, factory) {
    const markets = await queryContract({
        contract: factory,
        chain: chain,
        data: {'markets': {}}
    });

    return markets.markets
}

async function getMarketAddr(chain, factory, marketId) {
    const marketInfo = await queryContract({
        contract: factory,
        chain: chain,
        data: {'market_info': {'market_id': marketId}}
    });

    return marketInfo.market_addr;
}

async function getMarketStatus(chain, marketAddr) {
    return await queryContract({
        contract: marketAddr,
        chain: chain,
        data: {'status': {}}
    });
}

async function getBalance(chain, address, denom) {
    const url = `cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${denom}`;
    const endpoint = `${endPoints[chain]}/${url}`;
    const request =  await axios.get(endpoint);

    return request.data.balance;
}

module.exports = {
    timetravel: false,
    methodology: "TVL is the sum of deposits into the Liquidity pools combined with the sum of trader collateral for open and pending positions",
    osmosis: {
        tvl: osmosisTvl
    },
    sei: {
        tvl: seiTvl,
    },
}

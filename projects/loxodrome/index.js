const { sumTokensExport } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");

const balances = {};

const PAIR_FACTORY = "0x92bfa051bf12a0aef9a5e1ac8b2aa7dc1b05a406";
const VOTER = "0x5792c972D8D4b43c0c154Fba8215c28133e5b7f0";

async function getPairs(api, factory) {
    const pairs = await api.call({
        abi: "function pairs() external view returns(address[] memory )",
        target: factory,
    });
    sdk.log(pairs);
    const tokens0 = await api.multiCall({
        abi: "address:token0",
        calls: pairs.map((pair) => ({ target: pair })),
    });
    const tokens1 = await api.multiCall({
        abi: "address:token1",
        calls: pairs.map((pair) => ({ target: pair })),
    });
    const gauges = await api.multiCall({
        abi: 'function gauges(address) external view returns(address)',
        calls: pairs.map((pair) => ({ target: VOTER, params: [pair] })),
    });
    const ownerTokens = [];
    if (pairs.length > 0) {
        pairs.map((pair, idx) => {
            ownerTokens.push([
                [tokens0[idx].toLowerCase(), tokens1[idx].toLowerCase()],
                pair.toLowerCase(),
            ]);
        });
    }
    if (gauges.length > 0) {
        gauges.map((gauge, idx) => {
            if (gauge === "0x0000000000000000000000000000000000000000") {
                return;
            }
            ownerTokens.push([
                [tokens0[idx].toLowerCase(), tokens1[idx].toLowerCase()],
                gauge.toLowerCase(),
            ]);
        });
    }
    return ownerTokens;
}

module.exports = {
    iotex: {
        tvl: async (api) =>
            sumTokensExport({
                api,
                balances,
                ownerTokens: await getPairs(api, PAIR_FACTORY),
                resolveLP: true,
            })(),
    },
};


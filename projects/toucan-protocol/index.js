const sdk = require("@defillama/sdk");
const { CONFIG_DATA } = require("./config");

const isNctLive = (chain, block) => {
    return ((chain === "polygon" && block >= 24749944) || chain !== "polygon");
};

const getCalculationMethod = (chain) => {
    return async (timestamp, block, chainBlocks) => {
        const supplyCalls = [
            {target: CONFIG_DATA[chain].bct}
        ];

        if (isNctLive(chain, chainBlocks[chain])) {
            supplyCalls.push({
                target: CONFIG_DATA[chain].nct
            });
        }

        const supplies = (
            await sdk.api.abi.multiCall({
                abi: 'erc20:totalSupply',
                calls: supplyCalls,
                chain,
                block: chainBlocks[chain],
            })
        ).output;

        const balances = {};
        sdk.util.sumSingleBalance(balances, `${chain}:${CONFIG_DATA[chain].bct}`, supplies[0].output);
        if (isNctLive(chain, chainBlocks[chain])) {
            sdk.util.sumSingleBalance(balances, `${chain}:${CONFIG_DATA[chain].nct}`, supplies[1].output);
        }

        return balances;
    };
};

module.exports={
    timetravel: true,
    celo: {
        tvl: getCalculationMethod("celo")
    },
    polygon: {
        tvl: getCalculationMethod("polygon")
    },
    hallmarks: [
        [1634736872, "KlimaDAO launch"],
        [1644330872, "NCT launch"],
        [1660147200, "Celo launch"],
    ]
};

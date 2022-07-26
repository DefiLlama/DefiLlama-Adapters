const sdk = require("@defillama/sdk");
const { CONFIG_DATA } = require("./config");

const getCalculationMethod = (chain) => {
    return async (timestamp, block, chainBlocks) => {
        const supplyCalls = [
            {target: CONFIG_DATA[chain].bct},
            {target: CONFIG_DATA[chain].nct}
        ];

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
        sdk.util.sumSingleBalance(balances, `${chain}:${CONFIG_DATA[chain].nct}`, supplies[1].output);

        return balances;
    };
};

module.exports={
    timetravel: true,
    polygon: {
        tvl: getCalculationMethod("polygon")
    },
    hallmarks: [
        [1634736872, "KlimaDAO launch"],
        [1644330872, "NCT launch"],
    ]
};

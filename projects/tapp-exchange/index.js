const {function_view} = require("../helper/chain/aptos");

const MODULE_VIEW = "0xf5840b576a3a6a42464814bc32ae1160c50456fb885c62be389b817e75b2a385"

async function getPools() {
    return await function_view({
        functionStr: `${MODULE_VIEW}::tapp_views::get_pool_metas`,
        args: [],
        type_arguments: [],
    });
}

async function getPairedCoin(address) {
    const result = await function_view({
        functionStr: "0x1::coin::paired_coin",
        args: [address],
        type_arguments: [],
    });

    const [coinInfo] = result.vec || [];

    if (!coinInfo) return null;

    const {account_address, module_name, struct_name} = coinInfo;

    const module = Buffer.from(module_name.replace(/^0x/, ""), "hex").toString("utf-8");
    const struct = Buffer.from(struct_name.replace(/^0x/, ""), "hex").toString("utf-8");

    return `${account_address}::${module}::${struct}`;
}


module.exports = {
    methodology: "Measures the total liquidity across all pools on TAPP Exchange.",
    timetravel: false,
    aptos: {
        tvl: async (api) => {
            const pools = await getPools();

            // The first element is not considered a pool reserve.
            pools.shift();

            for (const pool of pools) {
                const coinA = await getPairedCoin(pool.assets[0]) || pool.assets[0];
                const coinB = await getPairedCoin(pool.assets[1]) || pool.assets[1];

                api.add(coinA, pool.reserves[0]);
                api.add(coinB, pool.reserves[1]);
            }
        },
    },
};


const sui = require("../helper/chain/sui");

async function suiTVL(api) {
    const factoryId = "0x57ecad13fb5c117a23b6e02399d3f0e539583dff324cb63761537091fe313d3d";

    const factory = await sui.getObject(factoryId);
    const poolsTableId = factory.fields.pools.fields.id.id;

    const poolEntries = await sui.getDynamicFieldObjects({ parent: poolsTableId });
    const poolObjectIds = poolEntries.map((entry) => entry.fields.value);
    const poolObjects = await sui.getObjects(poolObjectIds);

    for (const pool of poolObjects) {
        const fields = pool.fields;

        const balanceA = fields.balance_a;
        const balanceB = fields.balance_b;

        if (!balanceA || !balanceB) continue;
        if (balanceA === "0" && balanceB === "0") continue;

        const coinA = pool.type.split("Pool<")[1].split(",")[0].trim();
        const coinB = pool.type.split(",")[1].replace(">", "").trim();

        api.add(coinA, balanceA);
        api.add(coinB, balanceB);
    }
}

module.exports = {
    timetravel: false,
    sui: {
        tvl: suiTVL,
    },
};

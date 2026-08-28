const sui = require("../helper/chain/sui");

const FACTORIES = [
    {
        id: "0x57ecad13fb5c117a23b6e02399d3f0e539583dff324cb63761537091fe313d3d",
        name: "SuirewardsMe",
    },
    {
        id: "0x4190e8f8809f81e43cc2cce98786b2f498c81281e9153c17fc4c4e382fcbc105",
        name: "Lotus",
    },
];

async function processFactory(api, factoryId) {
    const factory = await sui.getObject(factoryId);
    const poolsTableId = factory.fields.pools.fields.id.id;

    const poolEntries = await sui.getDynamicFieldObjects({ parent: poolsTableId });
    const poolObjectIds = poolEntries.map((entry) => entry.fields.value);
    const poolObjects = await sui.getObjects(poolObjectIds);

    for (const pool of poolObjects) {
        const { balance_a: balanceA, balance_b: balanceB } = pool.fields;

        if (!balanceA || !balanceB || (balanceA === "0" && balanceB === "0")) continue;

        const match = pool.type.match(/Pool<(.+?),\s*(.+?)>/);
        if (!match) continue;

        const [, coinA, coinB] = match;

        api.add(coinA.trim(), balanceA);
        api.add(coinB.trim(), balanceB);
    }
}

async function suiTVL(api) {
    for (const { id } of FACTORIES) {
        await processFactory(api, id);
    }
}

module.exports = {
    timetravel: false,
    sui: {
        tvl: suiTVL,
    },
};
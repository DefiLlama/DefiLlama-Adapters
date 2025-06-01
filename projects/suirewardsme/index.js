const ADDRESSES = require('../helper/coreAssets.json');
const { default: BigNumber } = require("bignumber.js");
const sui = require("../helper/chain/sui");

async function suiTVL(api) {
    const factoryId = "0x57ecad13fb5c117a23b6e02399d3f0e539583dff324cb63761537091fe313d3d";

    const factory = await sui.getObject(factoryId);
    const poolsTableId = factory.fields.pools.fields.id.id;

    const poolEntries = await sui.getDynamicFieldObjects({ parent: poolsTableId });
    console.log("Found pools from table:", poolEntries.length);

    const poolObjectIds = poolEntries.map((entry) => entry.fields.value);
    const poolObjects = await sui.getObjects(poolObjectIds);
    console.log("Fetched pool object details:", poolObjects.length);

    const totalResult = {};

    for (const pool of poolObjects) {
        const fields = pool.fields;
        const balanceA = new BigNumber(fields.balance_a);
        const balanceB = new BigNumber(fields.balance_b);

        if (!balanceA || !balanceB) {
            console.log("❌ Missing balance fields in pool:", pool.type);
            continue;
        }
        if (balanceA.isZero() && balanceB.isZero()) continue;

        const amountA = new BigNumber(balanceA);
        const amountB = new BigNumber(balanceB);

        const coinA = pool.type.split("Pool<")[1].split(",")[0].trim();
        const coinB = pool.type.split(",")[1].replace(">", "").trim();

        console.log(`🪙 ${coinA} = ${amountA.toFixed()}, ${coinB} = ${amountB.toFixed()}`);

        setPropertyPriceMap(totalResult, coinA, amountA);
        setPropertyPriceMap(totalResult, coinB, amountB);
    }

    for (const token in totalResult) {
        api.add(token, totalResult[token].toFixed(0));
    }
}

function setPropertyPriceMap(map, key, value) {
    if (map[key]) {
        map[key] = map[key].plus(value);
    } else {
        map[key] = value;
    }
}

module.exports = {
    sui: {
        tvl: suiTVL,
    },
};
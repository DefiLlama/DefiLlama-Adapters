const suiTx = require("./suiTx");
const sui = require("../helper/chain/sui");
const { getConfig } = require("../helper/cache");
const { addUniV3LikePosition } = require("../helper/unwrapLPs");

const V1_PACKAGE = "0x8462eb7e1c52018f42f2dd2c33605f7212ad8702739a5eaacb0e1a0106f3dc6a";
const VAULTS_API = "https://haedal.xyz/api/v3/sui/vaults/pools?category=haedal&order_by=tvl&id=&coin_type=";

function asIntN(bits) {
    const n = Number(bits);
    return n >= 0x80000000 ? n - 0x100000000 : n;
}

async function getV1Tvl(api, vault) {
    const { coin_type_a, coin_type_b, lp_type, id, clmm_pool } = vault;
    const [coinA, coinB] = await suiTx.getVaultTokenBalance(V1_PACKAGE, [lp_type, coin_type_a, coin_type_b], id, clmm_pool);
    api.add(coin_type_a, coinA);
    api.add(coin_type_b, coinB);
}

async function getV2Tvl(api, vault) {
    const vaultObj = await sui.getObject(vault.id);
    if (!vaultObj) return;

    // idle funds
    const balances = vaultObj.fields?.buffer_assets?.fields?.balances?.fields?.contents || [];
    for (const entry of balances) {
        const token = '0x' + entry.fields.key.fields.name;
        const amount = entry.fields.value;
        if (amount && amount !== '0') api.add(token, amount);
    }

    // market positions
    const marketsId = vaultObj.fields?.markets?.fields?.id?.id;
    if (!marketsId) return;
    const markets = await sui.getDynamicFieldObjects({ parent: marketsId });

    for (const market of markets) {
        const positionsId = market.fields?.positions?.fields?.id?.id;
        if (!positionsId) continue;
        const isClmm = market.type?.includes('CLMMMarket');

        const positions = await sui.getDynamicFieldObjects({ parent: positionsId });
        for (const posObj of positions) {
            const pos = posObj.fields?.position?.fields;
            if (!pos) continue;

            if (isClmm) {
                const poolObj = await sui.getObject(pos.pool);
                if (!poolObj) continue;
                const token0 = '0x' + pos.coin_type_a.fields.name;
                const token1 = '0x' + pos.coin_type_b.fields.name;
                addUniV3LikePosition({
                    api,
                    tickLower: asIntN(pos.tick_lower_index.fields.bits),
                    tickUpper: asIntN(pos.tick_upper_index.fields.bits),
                    tick: asIntN(poolObj.fields.current_tick_index.fields.bits),
                    liquidity: pos.liquidity,
                    token0,
                    token1,
                });
            }
        }
    }
}

async function suiTVL(api) {
    const resp = await getConfig('haedal/vault', VAULTS_API);
    const vaultList = resp?.data?.list;

    for (const vault of vaultList) {
        if (vault.clmm_pool) {
            await getV1Tvl(api, vault);
        } else {
            await getV2Tvl(api, vault);
        }
    }
}

module.exports = {
    sui: {
        tvl: suiTVL,
    }
};

const suiTx = require("./suiTx");
const { getConfig } = require("../helper/cache");

async function suiTVL(api) {
    const packageId = "0x8462eb7e1c52018f42f2dd2c33605f7212ad8702739a5eaacb0e1a0106f3dc6a";
    const resp = await getConfig('haedal/vault', "https://haedal.xyz/api/v3/sui/vaults/pools?category=haedal&order_by=tvl&id=&coin_type=");
    const vaultList = resp?.data?.list;

    for (const vault of vaultList) {
        const { coin_type_a, coin_type_b, lp_type, id, clmm_pool } = vault;
        const [coinA, coinB] = await suiTx.getVaultTokenBalance(packageId, [lp_type, coin_type_a, coin_type_b], id, clmm_pool);
        api.add(coin_type_a, coinA);
        api.add(coin_type_b, coinB);
    }
}

module.exports = {
    sui: {
        tvl: suiTVL,
    }
};

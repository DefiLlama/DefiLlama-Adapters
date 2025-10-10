const sui = require('../helper/chain/sui')
const USDC_COIN = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'

const VAULTS = [
    '0x6e53ffe5b77a85ff609b0813955866ec98a072e4aaf628108e717143ec907bd8',
    '0x041b49dc6625e074f452b9bc60a9a828aebfbef29bcba119ad90a4b11ba405bf',
    '0xa97cc9a63710f905deb2da40d6548ce7a75ee3dfe4be0c1d553553d2059c31a3',
    '0x27936e146ec8c695d14a3b900d21a495d2396c0a99e3c6766f86d15fe91d3897',
]

async function liquidStakingTVL() {
    const obj = await sui.getObject('0x2d914e23d82fedef1b5f56a32d5c64bdcc3087ccfea2b4d6ea51a71f587840e5')
    const totalSuiSupply = +obj.fields.validator_pool.fields.total_sui_supply
    return totalSuiSupply
}

async function getVaultTVL(api) {
    for (const address of VAULTS) {
        const vaultObj = await sui.getObject(address);
        const assetsValueTableId = vaultObj.fields.assets_value.fields.id.id;
        const assetTypes = vaultObj.fields.asset_types;

        let totalUsdValue = 0;

        for (const assetType of assetTypes) {
            const assetValueObj = await sui.getDynamicFieldObject(
                assetsValueTableId,
                assetType,
                { idType: '0x1::ascii::String' }
            );

            totalUsdValue += +assetValueObj.fields.value;
        }

        api.add(USDC_COIN, totalUsdValue / 1e3);
    }
}

async function tvl(api) {
    api.add('0x2::sui::SUI', await liquidStakingTVL())
    await getVaultTVL(api)
}

module.exports = {
    methodology: "Calculates the amount of SUI staked in Volo liquid staking contracts and tokens in Volo vaults. TVL includes LST (Liquid Staking) and all vault types combined.",
    misrepresentedTokens: true,
    sui: {
        tvl: tvl,
    },
}


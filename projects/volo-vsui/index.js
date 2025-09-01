const sui = require('../helper/chain/sui')
const axios = require("axios");

const naviApiURL = 'https://open-api.naviprotocol.io';

async function liquidStakingTVL() {
    const nativePoolObj = await sui.getObject('0x7fa2faa111b8c65bea48a23049bfd81ca8f971a262d981dcd9a17c3825cb5baf');

    const totalStakedValue = +(await sui.getDynamicFieldObject(
      nativePoolObj.fields.total_staked.fields.id.id,
      nativePoolObj.fields.staked_update_epoch,
      {
          idType: 'u64'
      })).fields.value + +nativePoolObj.fields.pending.fields.balance;

    const totalPendingRewards = +nativePoolObj.fields.total_rewards - nativePoolObj.fields.collected_rewards;
    const unstakeTicketsSupply = +nativePoolObj.fields.ticket_metadata.fields.total_supply;

    const totalStakedSui = totalStakedValue + totalPendingRewards - unstakeTicketsSupply;

    return totalStakedSui / 1e9;
}

async function getVaultTVL() {
    try {
        const response = await axios.get(`${naviApiURL}/api/volo/volo-vaults?type=tvl`);
        
        if (response.data && response.data.code === 0 && response.data.data) {
            return response.data.data;
        } else {
            console.error('Invalid response format from NAVI API:', response.data);
            return {};
        }
    } catch (error) {
        console.error('Error fetching vault TVL from NAVI API:', error.message);
        return {};
    }
}

async function tvl(api) {
    const lstTVL = await liquidStakingTVL();
    api.add('0x2::sui::SUI', lstTVL);

    const vaultData = await getVaultTVL();
    
    for (const [vaultAddress, tvlValue] of Object.entries(vaultData)) {
        if (tvlValue && tvlValue > 0) {
            const coinType = extractCoinType(vaultAddress);
            if (coinType) {
                api.add(coinType, tvlValue);
            }
        }
    }
}

function extractCoinType(vaultAddress) {
    const parts = vaultAddress.split('::');
    if (parts.length >= 3) {
        return vaultAddress;
    }
    return null;
}

module.exports = {
    methodology: "Calculates the amount of SUI staked in Volo liquid staking contracts and tokens in Volo vaults. TVL includes LST (Liquid Staking) and all vault types combined.",
    sui: {
        tvl: tvl,
    },
    tvl: tvl,
}


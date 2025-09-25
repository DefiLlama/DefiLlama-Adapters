const sui = require('../helper/chain/sui')
const axios = require("axios");
const ADDRESSES = require('../helper/coreAssets.json');

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

    return totalStakedSui;
}

async function getVaultTVL() {
    const response = await axios.get(`${naviApiURL}/api/volo/volo-vaults?type=tvl`);
    
    if (response.data && response.data.code === 0 && response.data.data) {
        return response.data.data;
    }
    
    return {};
}

async function tvl(api) {
    const lstTVL = await liquidStakingTVL();
    api.add(ADDRESSES.sui.SUI, lstTVL);

    const vaultData = await getVaultTVL();
    
    for (const [tokenAddress, tvlValue] of Object.entries(vaultData)) {
        if (tvlValue && tvlValue > 0) {
            let adjustedValue = tvlValue;
            
            if (tokenAddress.includes('usdc::USDC')) {
                adjustedValue = tvlValue * 1e6; 
            } else if (tokenAddress.includes('xbtc::XBTC')) {
                adjustedValue = tvlValue * 1e8; 
            } else if (tokenAddress.includes('btc::BTC')) {
                adjustedValue = tvlValue * 1e8; 
            }
            
            api.add(tokenAddress, adjustedValue);
        }
    }
}



module.exports = {
    methodology: "Calculates the amount of SUI staked in Volo liquid staking contracts and tokens in Volo vaults. TVL includes LST (Liquid Staking) and all vault types combined.",
    sui: {
        tvl: tvl
    }
}


const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  base: {
    pool: '0x131711b38BE467212D328269482EfF626D0Ae586'
  },
  bsc: {
    simple: '0x471461A60EC3855DC58E00De81E3510b8945D2f9'
  }
}

const PROMO_BTCB_SIMPLE_STAKE_ABI =
  "function totalStaked() view returns (uint256)";

// Campaign id starts from 1 and auto increments
const promoPoolCampaignCountAbi =
  "function campaignCount() view returns (uint256)";

const promoPoolTotalStakeAbi = "function getCampaign(uint256 _campaignId) view returns (tuple(address token, address, address, uint256, uint256, uint256 totalStaked, uint256, uint256, bool, bool, bool))";

async function promoTvl(api) {
  if (config[api.chain]?.simple) {
    const BTCBStaked = await api.call({  abi: PROMO_BTCB_SIMPLE_STAKE_ABI, target: config[api.chain].simple})  
    api.add(ADDRESSES.bsc.BTCB, BTCBStaked)
  }

  if (!config[api.chain]?.pool) return api

  const campaignCount = await api.call({ 
    abi: promoPoolCampaignCountAbi, 
    target: config[api.chain].pool 
  });

  const campaignIds = Array.from(
    { length: Number(campaignCount) }, 
    (_, i) => i + 1
  );

  const campaigns = await api.multiCall({
    abi: promoPoolTotalStakeAbi,
    calls: campaignIds.map(id => ({
      target: config[api.chain].pool,
      params: [id]
    }))
  });

  const tokenTvls = {};
  campaigns.forEach(campaign => {
    const { token, totalStaked } = campaign;
    if (!tokenTvls[token]) {
      tokenTvls[token] = 0n;
    }
    tokenTvls[token] = tokenTvls[token] + BigInt(totalStaked);
  });

  Object.entries(tokenTvls).forEach(([token, balance]) => {
    api.add(token, balance);
  });
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: promoTvl }
})
const axios = require('axios');
const { sumTokens } = require("../helper/chain/bitcoin");
const sdk = require('@defillama/sdk')

const VAULTER_CORE = "0x3093304eCE0F35969B580CbD155a1357829870f2";
const abi = {
  roundTag:    "function roundTag() view returns (uint256)",
  totalCore:   "function totalAssets() view returns (uint256)",
  maxAllowedDelegators: 'function maxAllowedDelegators() view returns (uint256)',
  allowedDelegators: 'function allowedDelegators(uint256) view returns (address)',
};

const CORE_API_LIVENET_URI = 'https://stake.coredao.org';


async function tvlCoreStaking(api) {
  // total CORE staked
  const coreWei = await api.call({ abi: abi.totalCore,   target: VAULTER_CORE });

  api.addGasToken(coreWei);

  return api.getBalances();
}


async function tvlBitcoinStaking() {
  const api = new sdk.ChainApi({ chain: 'core' });

  // Fetch max allowed delegators
  const totalDelegators = await api.call({ abi: abi.maxAllowedDelegators, target: VAULTER_CORE });
  
  // Gather on-chain delegator addresses
  const dualDelegators = [];
  for (let i = 0; i < Number(totalDelegators); i++) {
      const del = await api.call({ abi: abi.allowedDelegators, target: VAULTER_CORE, params: [i] });
      dualDelegators.push(del);
  }

  // Fetch list of redeeem addresses for Staked Bitcion on CoreDao
  let btcDelegations = [];
  for (const address of dualDelegators) {
    const { data } = await axios.post(
      `${CORE_API_LIVENET_URI}/api/staking/search_mystaking_btc_delegator`,
      { pageNum: '1', pageSize: '100', addressHash: address }
    );          
    const records = data?.data?.records || [];
    
    for (const rec of records) {
      if (rec.redeemBtcAddress) btcDelegations.push(rec.redeemBtcAddress);
    }
  }

  return sumTokens({owners: btcDelegations})
}

module.exports = { tvlCoreStaking, tvlBitcoinStaking };

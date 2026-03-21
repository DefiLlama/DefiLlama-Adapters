const { sumTokensExport } = require('../helper/unwrapLPs');
const sdk = require('@defillama/sdk');

const BONDING_CURVE  = '0x0b6A9622fdC63B2aB23494b79d8e1816E572969C';
const POOL_FACTORY   = '0xd2a7b6c7ABA8e9cAE804178397c63A8238f85F8F';
const STAKING        = '0x5fc9Cfb37f8Fd15BDBfeD8732cE247815b36eD9f';
const TOKEN_999      = '0x1667810674ebA5aEf308CE6cC53cf4C6CfF5E94f';

async function tvl(api) {
  // Native BDAG locked in bonding curve (reserves for active token launches)
  const bondingBalance = await api.getBalance(BONDING_CURVE);
  api.addGasToken(bondingBalance);
}

async function staking(api) {
  // $999 tokens staked in Staking999 contract
  return api.sumTokens({ owner: STAKING, tokens: [TOKEN_999] });
}

module.exports = {
  methodology: 'Counts native BDAG locked in the 999DEX BondingCurve contract as TVL, and $999 tokens staked in the Staking999 contract.',
  blockdag: {
    tvl,
    staking,
  },
};

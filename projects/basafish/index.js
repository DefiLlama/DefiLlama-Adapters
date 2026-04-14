const ADDRESSES = require('../helper/coreAssets.json')
const FUND_MULTISIG = '0x7C4c871366F2Fd7ee891542fB1a0685096388824';

async function tvl(api) {
  await api.sumTokens({
    owners: [FUND_MULTISIG],
    tokens: [ADDRESSES.base.USDC, ADDRESSES.base.USDT],
  });
}

module.exports = {
  methodology: 'Counts USDC and USDT held in the fund multi-sig wallet that receives user deposits.',
  base: { tvl },
};

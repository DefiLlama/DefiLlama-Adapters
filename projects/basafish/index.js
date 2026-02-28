const FUND_MULTISIG = '0x7C4c871366F2Fd7ee891542fB1a0685096388824';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDT = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2';

async function tvl(api) {
  await api.sumTokens({
    owners: [FUND_MULTISIG],
    tokens: [USDC, USDT],
  });
}

module.exports = {
  methodology: 'Counts USDC and USDT held in the fund multi-sig wallet that receives user deposits.',
  base: { tvl },
};

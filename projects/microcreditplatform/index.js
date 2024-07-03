const sdk = require('@defillama/sdk');

const microcreditInvestmentContract = '0x3B724e84Fd7479C1bed10cAf8eed825dad852C1b';
const microcreditProfitShareContract = '0x78ed6350E3E4A0Fa59C48DA702d66cEe90F38BDB';

const fakeUsdt = '0xe5CeD8244f9F233932d754A0B1F7268555FBd3B5';
const fakeMct = '0x829e43f497b8873fA5c83FcF665b96A39a1FBeD6';

async function tvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks.haqq;

  // Mikro kredi yatırım sözleşmesinin token bakiyelerini al
  const investmentBalances = await sdk.api.abi.multiCall({
    calls: [
      {
        target: fakeUsdt,
        params: [microcreditInvestmentContract],
      },
      {
        target: fakeMct,
        params: [microcreditInvestmentContract],
      }
    ],
    abi: 'erc20:balanceOf',
    block,
    chain: 'haqq'
  });

  sdk.util.sumMultiBalanceOf(balances, investmentBalances);

  // Mikro kredi kar payı sözleşmesinin token bakiyelerini al
  const profitShareBalances = await sdk.api.abi.multiCall({
    calls: [
      {
        target: fakeUsdt,
        params: [microcreditProfitShareContract],
      },
      {
        target: fakeMct,
        params: [microcreditProfitShareContract],
      }
    ],
    abi: 'erc20:balanceOf',
    block,
    chain: 'haqq'
  });

  sdk.util.sumMultiBalanceOf(balances, profitShareBalances);

  return balances;
}

module.exports = {
  haqq: {
    tvl,
  },
  methodology: 'counts the number of fake USDT and MCT tokens in the MicrocreditInvestment and MicrocreditProfitShare contracts.',
};

const sdk = require('@defillama/sdk');

const microcreditInvestmentContract = '0x951d1571C75C519Cc3D09b6B71595C6aCe1c06dB';
const microcreditProfitShareContract = '0x165D74d2DEFe37794371eB63c63999ab5620DBfB';

const axlUSDC = '0x0CE35b0D42608Ca54Eb7bcc8044f7087C18E7717';
const MCT = '0xA8759ca1758fBd8db3BA14C31d2284ae58a64CD1';

async function tvl(chainBlocks) {
  const balances = {};
  const block = chainBlocks.haqq;

  // Mikro kredi yatırım sözleşmesinin token bakiyelerini al
  const investmentBalances = await sdk.api.abi.multiCall({
    calls: [
      {
        target: axlUSDC,
        params: [microcreditInvestmentContract],
      },
      {
        target: MCT,
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
        target: axlUSDC,
        params: [microcreditProfitShareContract],
      },
      {
        target: MCT,
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

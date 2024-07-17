const BNRY_TOKEN_CONTRACT = '0xb5090d514bcaca7dafb7e52763658844121f346d';
const EOA_WALLET = '0xfB1dA2bA2B6c1e73e4Ace7aF2A38Fea4C289508e';

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: BNRY_TOKEN_CONTRACT,
    params: [EOA_WALLET],
  });

  api.add(BNRY_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
  methodology: 'counts the number of BNRY tokens in the specified contract on Optimism.',
  start: 1709286506,
  optimism: {
    tvl,
  },
};

const USD0PP_TOKEN_CONTRACT = '0x35D8949372D46B7a3D5A56006AE77B215fc69bC0';

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:totalSupply',
    target: USD0PP_TOKEN_CONTRACT,
  });

  api.add(USD0PP_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
  doublecounted: true,
  methodology: 'counts the number of locked USD0 tokens in the form of USD0++.',
  start: 20025769,
  ethereum: {
    tvl,
  }
};

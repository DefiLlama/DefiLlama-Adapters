const USD0_TOKEN_CONTRACT = '0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5';

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:totalSupply',
    target: USD0_TOKEN_CONTRACT,
  });

  api.add(USD0_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
  doublecounted: true,
  methodology: 'counts the number of USD0 tokens.',
  start: 19932960,
  ethereum: {
    tvl,
  }
};

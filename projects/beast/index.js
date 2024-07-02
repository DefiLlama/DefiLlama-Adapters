const BEAST_USDT_CONTRACT = '0x315F02dcc5C6852D169889b84Eb51Ca63Ce06b94';

async function tvl(api) {
  const bUSDTBalance = await api.call({
    abi: 'erc20:totalSupply',
    target: BEAST_USDT_CONTRACT,
  });

  // const tradePoolBalance = await api.call({
  //   abi: 'erc20:totalAssetsOfTradePool',
  //   target: BEAST_USDT_CONTRACT,
  // });

  api.add(BEAST_USDT_CONTRACT, bUSDTBalance)
  // api.add(BEAST_USDT_CONTRACT, tradePoolBalance)
}

module.exports = {
  methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
  start: 1000235,
  bevm: {
    tvl,
  }
}; 
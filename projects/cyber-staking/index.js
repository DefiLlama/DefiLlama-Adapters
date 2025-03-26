const STCYBR_TOKEN_CONTRACT = '0x3EfE22FA52F6789DDfc263Cec5BCf435b14b77e2';

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:totalSupply',
    target: STCYBR_TOKEN_CONTRACT,
  });

  // stCYBER is minted 1:1 with CYBER
  return {
    'coingecko:cyberconnect': collateralBalance / 1e18
  }
}

module.exports = {
  methodology: 'counts the number of CYBER tokens staked in the stCYBER contract.',
  start: 1718322729,
  cyeth: {
    tvl,
  }
}; 
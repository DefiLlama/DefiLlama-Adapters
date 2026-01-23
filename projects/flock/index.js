const FLOCK_TOKEN_CONTRACT = '0x5aB3D4c385B400F3aBB49e80DE2fAF6a88A7B691';
const GM_EXCHANGE_CONTRACT = '0xe1Fa4592b7a35Ff6Cef65FDEC5e13A1F48fC6123';

async function tvl(api) {
  const stakedBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: FLOCK_TOKEN_CONTRACT,
    params: [GM_EXCHANGE_CONTRACT],
  });

  api.add(FLOCK_TOKEN_CONTRACT, stakedBalance)
}

module.exports = {
  methodology: 'counts the number of FLOCK tokens in the FLOCK GMExchange contract.',
  start: 1747913430,
  base: {
    tvl,
  }
}; 
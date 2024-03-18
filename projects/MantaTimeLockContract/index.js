const MANTA = '0x95CeF13441Be50d20cA4558CC0a27B601aC544E5';
const STONE = '0xEc901DA9c68E90798BbBb74c11406A32A70652C3';
const TIME_LOCK_CONTRACT = '0x8Bb6CaE3f1CADA07Dd14bA951e02886ea6bBA183';

async function tvl(_, _1, _2, { api }) {
  const mantaBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: MANTA,
    params: [TIME_LOCK_CONTRACT],
  });

  api.add(MANTA, mantaBalance);
  
  const stoneBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: STONE,
    params: [TIME_LOCK_CONTRACT],
  });

  api.add(STONE, stoneBalance);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of (MANTA OR STONE) in the time lock contract.',
  start: 1497066,
  manta: {
    tvl,
  }
}; 

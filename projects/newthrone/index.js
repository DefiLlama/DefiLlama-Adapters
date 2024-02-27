const GAME_CONTRACT = '0x61C3A357bc3ca51b80eCD36CB1Ae37e5465C6701';
const THRO = '0x0f929C29dcE303F96b1d4104505F2e60eE795caC';

async function tvl(_, _1, _2, { api }) {
  const gameContractBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: THRO,
    params: [GAME_CONTRACT],
  });

  api.add(THRO, gameContractBalance)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'THRO tokens in the Game contract, which represents the current balance of the game (total spent - total claimed).',
  base: {
    tvl,
  }
}; 
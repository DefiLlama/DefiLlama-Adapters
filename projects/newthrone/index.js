const GAME_CONTRACT = '0x61C3A357bc3ca51b80eCD36CB1Ae37e5465C6701';
const WETH = '0x4200000000000000000000000000000000000006';

async function tvl(_, _1, _2, { api }) {
  const gameContractBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WETH,
    params: [GAME_CONTRACT],
  });

  api.add(WETH, gameContractBalance)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'WETH tokens in the Game contract, which represents the current balance of the game (total spent - total claimed).',
  base: {
    tvl,
  }
}; 
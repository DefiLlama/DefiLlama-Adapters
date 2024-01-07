const TOKEN_ADDRESS = '0x652000ba3c230d83279AEC84A49d41d706AFB0F1';
const StakingContract1 = '0x8aCE17bAadBbAfb8178330d4C87C224a08826520';
const StakingContract2 = '0xe0Ceee33e1CE1EF4EA322B50D55d99E714B7BB6d';

async function tvl(_, _1, _2, { api }) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: TOKEN_ADDRESS,
    params: [StakingContract1],
  });

  const collateralBalance2 = await api.call({
    abi: 'erc20:balanceOf',
    target: TOKEN_ADDRESS,
    params: [StakingContract2],
  });

  api.add(TOKEN_ADDRESS, collateralBalance)
  api.add(TOKEN_ADDRESS, collateralBalance2)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'This is the total value locked in y24 staking',
  start: 35011373,
  bsc: {
    tvl,
  }
};


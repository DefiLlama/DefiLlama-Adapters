const STAKE_HOPE_ADDRESS = '0xF5C6d9Fc73991F687f158FE30D4A77691a9Fd4d8'
const TOKEN_HOPE_ADDRESS = '0xc353bf07405304aeab75f4c2fac7e88d6a68f98e'


async function tvl(_, _1, _2, { api }) {
  const collateralBalance = await api.call({
    abi: 'function lpTotalSupply() public view override returns (uint256)',
    target: STAKE_HOPE_ADDRESS,
    params: [],
  });

  api.addTokens([STAKE_HOPE_ADDRESS, TOKEN_HOPE_ADDRESS], [collateralBalance, collateralBalance])
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'Number of HOPE pledges.',
  ethereum: {
    tvl,
  },
};
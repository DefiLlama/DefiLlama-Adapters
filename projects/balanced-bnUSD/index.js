const { call, sumTokens } = require('../helper/chain/icx.js')

// https://docs.balanced.network/smart-contracts
const balancedLoansContract = 'cx66d4d90f5f113eba575bf793570135f9b10cece1';
const stabilityFundContract = 'cxa09dbb60dcb62fffbd232b6eae132d730a2aafa6';

async function tvl(api) {
  const supportedTokens = await call(stabilityFundContract, 'getAcceptedTokens')
  const tokens = Object.values(await call(balancedLoansContract, 'getCollateralTokens'))
  await sumTokens({ api, tokens: supportedTokens, owner: stabilityFundContract })
  return sumTokens({ api, tokens, owner: balancedLoansContract })
}

module.exports = {
  methodology: 'TVL consists of collateral deposits made to the lending program and the stability fund.',
  icon: {
    tvl
  },
};

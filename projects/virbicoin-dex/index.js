const { getUniTVL } = require('../helper/unknownTokens');
const { staking } = require('../helper/staking');

// Contract addresses
const FACTORY = '0x663B1b42B79077AaC918515D3f57FED6820Dad63';
const MASTERCHEF = '0x12A656c2DeE0EA2685398d52AcF78974fCD67B27';

// Token addresses
const VBCG = '0xac7F60af25C5c4E23d1008C46511e265A8c9B6cF';

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is calculated by summing the liquidity in all AMM pools (Uniswap V2 fork) and staked LP tokens in the MasterChef contract.',
  virbicoin: {
    tvl: getUniTVL({
      factory: FACTORY,
      useDefaultCoreAssets: true,
      fetchBalances: true,
    }),
    staking: staking(MASTERCHEF, VBCG),
  },
};

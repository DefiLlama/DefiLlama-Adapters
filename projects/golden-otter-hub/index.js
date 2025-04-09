const { sumUnknownTokens } = require('../helper/unknownTokens')
const GOLDEN_OTTER = '0x57268aFa4E496684611aAFB1E20D2116283C487e';
const STAKING_CONTRACT = '0xc631A1A2E53984b461556b030A532BB83Bf49aEb';

const PAIR_GOTR_WLD = '0xccbbace82078705cab7f49b22fbdebfc3eb58840';

const staking = async (api) => {
  return sumUnknownTokens({
    tokens: [GOLDEN_OTTER],
    owner: STAKING_CONTRACT,
    lps: [PAIR_GOTR_WLD],
    api,
    useDefaultCoreAssets: true,
  })
}

module.exports = {
  methodology: 'Count TVL by counting the balance of the token in the staking contract and calculating its value in WLD based on the reserves of the GOTR/WLD pair.',
  wc: {
    tvl: () => ({}),
    staking,
  }
};

const { sumUnknownTokens } = require('../helper/unknownTokens')

const GOLDEN_OTTER = '0x57268aFa4E496684611aAFB1E20D2116283C487e';
const OTTERVERSE = '0xBD179ad384a11Ac2162c0E808212ee3699D18447';

const LEGACY_STAKING_CONTRACT = '0xc631A1A2E53984b461556b030A532BB83Bf49aEb';
const OTTV_STAKING_CONTRACT = '0x566c5441de4e952bc40aEE33004e42Da2Bc1e982';

const PAIR_GOTR_WLD = '0xccbbace82078705cab7f49b22fbdebfc3eb58840';
const PAIR_OTTV_WLD = '0x9704d4c477a865ca359605d701aeffa1c4553e81';

const staking = async (api) => {
  return sumUnknownTokens({
    tokensAndOwners: [
      [GOLDEN_OTTER, LEGACY_STAKING_CONTRACT],
      [OTTERVERSE, OTTV_STAKING_CONTRACT],
    ],
    lps: [PAIR_GOTR_WLD, PAIR_OTTV_WLD],
    api,
    useDefaultCoreAssets: true,
  });
};

module.exports = {
  methodology: 'TVL is calculated by checking the balances of GOLDEN_OTTER and OTTERVERSE tokens staked in their respective contracts, and valuing them using their LP pairs against WLD.',
  wc: {
    tvl: () => ({}),
    staking,
  }
};

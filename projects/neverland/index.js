const { aaveV3Export } = require("../helper/aave");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Neverland Money - Aave V3-based lending protocol on Monad with vote-escrow tokenomics
// Docs: https://docs.neverland.money

const CONTRACTS = {
  monad: {
    poolDataProvider: '0xfd0b6b6F736376F7B99ee989c749007c7757fDba',
    dust: '0xAD96C3dffCD6374294e2573A7fBBA96097CC8d7c',
    dustLock: '0xBB4738D05AD1b3Da57a4881baE62Ce9bb1eEeD6C',
  },
};

const aaveConfig = {
  monad: [CONTRACTS.monad.poolDataProvider],
};

const aaveExports = aaveV3Export(aaveConfig);

async function staking(api) {
  const chain = api.chain;
  const contracts = CONTRACTS[chain];

  if (!contracts) return {};

  return sumTokens2({
    api,
    owner: contracts.dustLock,
    tokens: [contracts.dust],
  });
}

module.exports = {
  methodology: "TVL includes Aave V3 lending pools. Staking tracks DUST locked in veDUST for governance and incentives. Borrowed amounts track debt across all lending markets.",
  monad: {
    tvl: aaveExports.monad.tvl,
    borrowed: aaveExports.monad.borrowed,
    staking,
  },
};

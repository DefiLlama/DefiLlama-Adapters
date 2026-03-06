const { getFactoryTvl } = require("../terraswap/factoryTvl");

const factory = {
  classic: "inj1k9lcqtn3y92h4t3tdsu7z8qx292mhxhgsssmxg",
};

async function staking() {

  return {}

}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  injective: { tvl: getFactoryTvl(factory.classic), staking: staking },
};

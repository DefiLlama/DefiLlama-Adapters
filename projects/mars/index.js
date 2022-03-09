const { calculateRedBankTvl, calculateRedBankBorrowed } = require("./red_bank.js");
const { calculateStrategyTvl } = require("./fields_of_mars.js");

async function tvl(timestamp, block) {
  const redBankTvl = await calculateRedBankTvl();
  const lunaStrategyTvl = await calculateStrategyTvl(
    "terra1kztywx50wv38r58unxj9p6k3pgr2ux6w5x68md", // Fields of Mars LUNA-UST strategy
    "terra1m6ywlgn6wrjuagcmmezzz2a029gtldhey5k552", // Astroport LUNA-UST pair
    "terra1m24f7k4g66gnh9f7uncp32p722v0kyt3q4l3u5", // Astroport LUNA-UST LP token
  );
  const ancStrategyTvl = await calculateStrategyTvl(
    "terra1vapq79y9cqghqny7zt72g4qukndz282uvqwtz6", // Fields of Mars ANC-UST strategy
    "terra1qr2k6yjjd5p2kaewqvg93ag74k6gyjr7re37fs", // Astroport ANC-UST pair
    "terra1wmaty65yt7mjw6fjfymkd9zsm6atsq82d9arcd", // Astroport ANC-UST LP token
  );
  const mirStrategyTvl = await calculateStrategyTvl(
    "terra12dq4wmfcsnz6ycep6ek4umtuaj6luhfp256hyu", // Fields of Mars MIR-UST strategy
    "terra143xxfw5xf62d5m32k3t4eu9s82ccw80lcprzl9", // Astroport MIR-UST pair
    "terra17trxzqjetl0q6xxep0s2w743dhw2cay0x47puc", // Astroport MIR-UST LP token
  );

  const totalFieldsUstBorrow = (
    lunaStrategyTvl.ustBorrowed
    + ancStrategyTvl.ustBorrowed
    + mirStrategyTvl.ustBorrowed
  );

  return {
    "terra-luna": redBankTvl["terra-luna"] + lunaStrategyTvl.primaryBonded,
    "terrausd": redBankTvl["terrausd"] - totalFieldsUstBorrow, // subtract UST borrowed by Fields strategies to avoid double counting
    "anchor-protocol": ancStrategyTvl.primaryBonded,
    "mirror-protocol": mirStrategyTvl.primaryBonded,
  };
}

async function borrowed(timestamp, block) {
  return await calculateRedBankBorrowed();
}

module.exports = {
  timetravel: false,
  methodology: "We query Mars protocol smart contracts to get the amount of assets deposited and borrowed, then use Coingecko to price the assets in USD.",
  terra: { tvl, borrowed }
};

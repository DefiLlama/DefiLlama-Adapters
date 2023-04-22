const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  start: 1682899200,
  methodology: "Merlin is an immutable, permission-less and community centric DEX built on ZkSync with a goal to solve what might be called the “liquidity problem”. We achieve this by creating a liquidity environment that is robust and efficient. Consequently allowing builders and users to leverage our infrastructure for deep & readily accessible liquidity. Merlin's vision is to surpass current DEX offerings and, as the first of its kind on ZkSync, set a precedent for the standards required to become the beacon of liquidity of this ecosystem and provide 'True Yields'.",
  era: {
    tvl: getUniTVL({ factory: '0x63E6fdAdb86Ea26f917496bEEEAEa4efb319229F', useDefaultCoreAssets: true,  }),
  },
};

const { getUniTVL } = require("../helper/unknownTokens");
const { staking } = require("../helper/staking.js");

const config = {
  arbitrum: "0x61f4ECD130291e5D5D7809A112f9F9081b8Ed3A5",
  ethereum: "0xE48AEE124F9933661d4DD3Eb265fA9e153e32CBe",
  polygon_zkevm: "0x8aF94528FBE3c4C148523E7aAD48BcEbcC0A71d7",
  avax: "0xDC0BD72CdeF330786BF6f331a6Aca539c0bb4EaB",
};

const ethereum_staking = "0x6142b36B3dD1812993C2ecaa300b962A7Da0A900";

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
};

Object.keys(config).forEach((chain) => {
  const factory = config[chain];
  if (config[chain] == config["ethereum"]) {
    module.exports[chain] = {
      tvl: getUniTVL({
        factory,
        useDefaultCoreAssets: true,
      }),
      staking: staking(
        "0x6142b36B3dD1812993C2ecaa300b962A7Da0A900",
        "0x518b63Da813D46556FEa041A88b52e3CAa8C16a8",
        "ethereum"
      ),
    };
  } else {
    module.exports[chain] = {
      tvl: getUniTVL({
        factory,
        useDefaultCoreAssets: true,
      }),
    };
  }
});

//0xDCd2B58585DF999DD145e529f09e8ACaFA6cd244

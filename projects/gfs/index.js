const { sumUnknownTokens } = require("./../helper/unknownTokens");

function pool2(api) {
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, tokensAndOwners:[["0x19f3cb6a4452532793d1605c8736d4a94f48752c", "0x1ba725d2ba56482f11fee3642f1c739d25018e4d",]] })
}

module.exports = {
  iotex: {
    tvl: () => ({}),
    pool2,
  },
}
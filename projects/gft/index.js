const { sumUnknownTokens } = require("./../helper/unknownTokens");

const gfsBonusStackPool = "0x4346a618c2e3fd4cfa821e91216eaf927bd46ddd";
const gfs = "0x5d0f4ca481fd725c9bc6b415c0ce5b3c3bd726cf";

function pool2(api) {
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, tokensAndOwners:[
    ["0x53bdd401a871bd0f84e94619edcc0c24489d4aab", "0xde5914a97cc5066751624f053d719f67a4d69383",],
    [gfs, gfsBonusStackPool,],
  ] })
}

module.exports = {
  iotex: {
    tvl: () => ({}),
    pool2,
  },
};
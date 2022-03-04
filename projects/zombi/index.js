const { tombTvl } = require("../helper/tomb");

const token = "0xda5db6c2a2fd53a2d3fc4246bbd8acce5f93bae1";
const share = "0xb3584d821109e49a068a8c3a05f367bc54061252";
const rewardPool = "0x3E6a10C75d33D4fF95A33342d33A73176Bcd0629";
const masonry = "0x4E2950365024D27956538AB27C97083634DDBE90";

const pool2LPs = [
  "0xe577DF94b4Ea94399B7438e27EA1Ba81717464A0",
  "0x5db45a30732cf98fda72b9b91a0c554dc1f2e83b"
];

module.exports = {
  ...tombTvl(token, share, rewardPool, masonry, pool2LPs, "fantom", undefined, false, "0xe577DF94b4Ea94399B7438e27EA1Ba81717464A0")
}

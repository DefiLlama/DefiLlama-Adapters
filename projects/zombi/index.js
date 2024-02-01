const ADDRESSES = require('../helper/coreAssets.json')
const { zombiTvl } = require("./zombi");

const token = "0xda5db6c2a2fd53a2d3fc4246bbd8acce5f93bae1";
const share = "0xb3584d821109e49a068a8c3a05f367bc54061252";
const rewardPool = "0x3E6a10C75d33D4fF95A33342d33A73176Bcd0629";
const rewardPoolGeneris = "0xDa0cB4684b02D8bB253Af60a942625D1BC9Ba53d";
const masonry = "0x4E2950365024D27956538AB27C97083634DDBE90";

const pool2LPs = [
  "0xe577DF94b4Ea94399B7438e27EA1Ba81717464A0",
  "0x5db45a30732cf98fda72b9b91a0c554dc1f2e83b"
];
const listedTokenGeneris = [
  ADDRESSES.fantom.WFTM,//wftm
  '0x74b23882a30290451A17c44f4F05243b6b58C76d',//weth
  '0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE',//boo
  '0xaD996A45fd2373ed0B10Efa4A8eCB9de445A4302'//alpaca
]

module.exports = {
  hallmarks: [
    [1646870400, "Rug Pull"]
  ],
  ...zombiTvl(token, share, rewardPool, rewardPoolGeneris, masonry, pool2LPs, listedTokenGeneris, "fantom", undefined, false, "0xe577DF94b4Ea94399B7438e27EA1Ba81717464A0")
}

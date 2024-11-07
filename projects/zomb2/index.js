const ADDRESSES = require('../helper/coreAssets.json')
const { zombiTvl } = require("../zomb2/zombi");

const token = "0xA87bcE04d4a396DF40cC1be3a21CF04592C08290";
const share = "0x9E594379bC7e2034fCc8607Fb8C57F149Fb68284";
const rewardPool = "0x7b4C5f9Ed34519cBB99C833389582Dc3D4Fe1f1e";
const rewardPoolGeneris = "0x9D6f186223F6dbD3eBd265b98D82B0c6A5A3e41F";
const masonry = "0xBEe596786Db8C602661284e89D493B05b60E12Fc";

const pool2LPs = [
  "0x7333155e21E13Ce81e1206C80d3c7E3DA41C92a6",
  "0xEe17f36CdcA299eE7705413AB6111a8fe1B2dF17",
  //"0xe577DF94b4Ea94399B7438e27EA1Ba81717464A0",
  //"0x5db45a30732cf98fda72b9b91a0c554dc1f2e83b"
];

const listedTokenGeneris = [
  ADDRESSES.fantom.WFTM,//wftm
  '0x74b23882a30290451A17c44f4F05243b6b58C76d',//weth
  '0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE',//boo
  '0xaD996A45fd2373ed0B10Efa4A8eCB9de445A4302',//alpaca
  '0xda5db6c2a2fd53a2d3fc4246bbd8acce5f93bae1',//zombi
  '0xb3584d821109e49a068a8c3a05f367bc54061252',//szombi
]

module.exports = {
  ...zombiTvl(token, share, rewardPool, rewardPoolGeneris, masonry, pool2LPs, listedTokenGeneris, "fantom", undefined, false, "0x7333155e21E13Ce81e1206C80d3c7E3DA41C92a6")
}

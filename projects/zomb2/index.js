const { tombTvl } = require("../helper/tomb");

const token = "0xA87bcE04d4a396DF40cC1be3a21CF04592C08290";
const share = "0x9E594379bC7e2034fCc8607Fb8C57F149Fb68284";
const rewardPool = "0x7b4C5f9Ed34519cBB99C833389582Dc3D4Fe1f1e";
const masonry = "0xBEe596786Db8C602661284e89D493B05b60E12Fc";

const pool2LPs = [
  "0x7333155e21E13Ce81e1206C80d3c7E3DA41C92a6",
  "0xEe17f36CdcA299eE7705413AB6111a8fe1B2dF17"
];

module.exports = {
  ...tombTvl(token, share, rewardPool, masonry, pool2LPs, "fantom", undefined, false, "0x7333155e21E13Ce81e1206C80d3c7E3DA41C92a6")
}

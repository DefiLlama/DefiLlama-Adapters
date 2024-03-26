const { staking } = require("../helper/staking");

const A51_STAKING_CONTRACT = "0x10a62e0d8491751c40476d432f9e19ba8f699a61";
const A51 = "0xe9e7c09e82328c3107d367f6c617cf9977e63ed0";

module.exports.polygon.staking = staking(A51_STAKING_CONTRACT, A51);

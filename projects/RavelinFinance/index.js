const sdk = require("@defillama/sdk");
const { tombTvl } = require("../helper/tomb");

const ravTokenAddress = "0x9B7c74Aa737FE278795fAB2Ad62dEFDbBAedFBCA";
const rshareTokenAddress = "0xD81E377E9cd5093CE752366758207Fc61317fC70";
const rshareRewardPoolAddress = "0xa85B4e44A28B5F10b3d5751A68e03E44B53b7e89";
const boardroomAddress = "0x618C166262282DcB6Cdc1bFAB3808e2fa4ADFEc2";
const treasuryAddress = "0x351bDAC12449974e98C9bd2FBa572EdE21C1b7C4";

const mADALPs = [
  "0xd65005ef5964b035B3a2a1E79Ddb4522196532DE", // ravmADALpAddress
  "0x73bc306Aa2D393ff5aEb49148b7B2C9a8E5d39c8", //rsharemADALpAddress
];

module.exports = {
  ...tombTvl(ravTokenAddress, rshareTokenAddress, rshareRewardPoolAddress, boardroomAddress, mADALPs, "milkomeda", undefined, false, mADALPs[1])
}

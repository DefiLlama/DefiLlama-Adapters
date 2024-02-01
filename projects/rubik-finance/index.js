const { tombTvl } = require("../helper/tomb");

const rubikTokenAddress = "0xa4db7f3b07c7bf1b5e8283bf9e8aa889569fc2e7";
const rshareTokenAddress = "0xf619d97e6ab59e0b51a2154ba244d2e8157223fe";
const rshareRewardPoolAddress = "0xf6b082B2ab9F4b17d2015F82342C3CA2843d524D";
const boardroomAddress = "0x7617Ca396262B4Ada6c13a42c9e1BA0AEED11996";
const ftmLPs = [
  "0x9f4cbfa5B43252f3eD06f35C3f1A1D14C36bCeF0", // rubikFtmLpAddress
  "0xCb2534b86fDc053FA312745c281E0838f210e869", //rshareFtmLpAddress
];

module.exports = {
    ...tombTvl(rubikTokenAddress, rshareTokenAddress, rshareRewardPoolAddress, boardroomAddress, ftmLPs, "fantom", undefined, false, ftmLPs[1])
}

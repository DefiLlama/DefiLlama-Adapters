const { tombTvl } = require("../helper/tomb");

const draco = "0x37863ea4bf6ef836bC8bE909221BAF09A2aF43d7";
const sdraco = "0x713A18d059EA1D12E5bE134a864C075E47d5FEFA";
const rewardpool = "0x14b9189c9a7f31Fda0eed6B8D8afe91E098B303b";
const masonry = "0x39AEd2eC961AA9da9D778C80B6f90CD80dBFAE16";
const lps = [
    "0xa7207b4de8ba1f01adb7c59558ebebf8c4e48c53",
    "0xf4b787e9319ec4a83ac4fabc88ae1705c2c64031"
]

module.exports = {
    ...tombTvl(draco, sdraco, rewardpool, masonry, lps, "fantom", undefined, false, lps[1])
}
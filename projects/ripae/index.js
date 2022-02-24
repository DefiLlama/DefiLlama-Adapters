const { tombTvl } = require("../helper/tomb");

const token = "0x112df7e3b4b7ab424f07319d4e92f41e6608c48b";
const share = "0x8a41f13a4fae75ca88b1ee726ee9d52b148b0498";
const rewardPool = "0xa058316Af6275137B3450C9C9A4022dE6482BaC2";
const masonry = "0x704115B8200392f2855B400bf0E414F3C8c3A472";
const pool2 = [
    "0x9ce8e9b090e8af873e793e0b78c484076f8ceece",
    "0x2dc234dbfc085ddbc36a6eacc061d7333cd397b0"
]

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(token, share, rewardPool, masonry, pool2, "fantom", undefined, false, pool2[1])
}
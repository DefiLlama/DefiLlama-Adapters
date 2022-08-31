const { tombTvl } = require("../helper/tomb");


const token = "0x83dC7F38F94c5D0e0dC3695330367acb2a764907";
const share = "0x5B2Cf2d63299a473293577CF22a5241Fb0e8e1b2"
const rewardPool = "0x5b892d99BC94de7983fF156e5Ef917d7bC1a1690";
const masonry = "0xDC2b2C59eF33dA8E603d9F7B996DcDa3CD4CB6cd";
const pool2LPs = [
    "0x84895C6279E50C584CEbEd4963672F730b448df0",
    "0x1610C07565A2CfFf2809193A410Fb4EAAceAB378"
]

module.exports = {
    ...tombTvl(token, share, rewardPool, masonry, pool2LPs, "avax", undefined, false, pool2LPs[1])
}


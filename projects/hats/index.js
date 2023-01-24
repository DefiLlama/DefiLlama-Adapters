const { masterChefExports, } = require("../helper/masterchef")

const owner = '0x571f39d351513146248AcafA9D0509319A327C4D' // vault address
const token = "nulladdress";
module.exports = {
    ...masterChefExports(owner, "ethereum", token)
}
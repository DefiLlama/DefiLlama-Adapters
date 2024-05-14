const { masterChefExports, } = require("./helper/masterchef")

const token = "0xc67b9b1b0557aeafa10aa1ffa1d7c87087a6149e";
const masterchef = "0x0e69359B4783094260abFaD7dD904999fc1d6Fd0";

module.exports = masterChefExports(masterchef, "boba", token, false)
const { masterChefExports, } = require("../helper/masterchef")

const owner = '0x571f39d351513146248AcafA9D0509319A327C4D' // vault address
const token = "0x36f8d0d0573ae92326827c4a82fe4ce4c244cab6" // intentional wrong token TODO: find hats token
module.exports = masterChefExports(owner, "ethereum", token)
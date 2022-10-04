const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0x01E3788ef98F5672DC66185FBA1b50037BA1352d";
const token = "0xd0e7e2a4e0b7df94a095346c55665ba586d3caa4";

module.exports = {
    ...masterChefExports(masterchef, "fantom", token, false)
}
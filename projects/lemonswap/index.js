const {masterChefExports} = require("../helper/masterchef");

const token = "0x9477477CdDC4A05419A402A9754725Bc9Ee6a40e"
const masterchef = "0xD2C91aA7ffAb4CE218f7F6fc9AED7029A57C4B97";

module.exports = {
    ...masterChefExports(masterchef, "bsc", token, false)
}
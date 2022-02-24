const { masterChefExports } = require("../helper/masterchef");

const wst = "0xaAdFf17d56d80312b392Ced903f3E8dBE5c3ece7";
const masterchef = "0x5865C60C05C28C597b3CEB6a84809251101E5204";

module.exports = {
  ...masterChefExports(masterchef, "bsc", wst),
};
const { masterChefExports } = require("../helper/masterchef");

const token = "0xC3B538219B73efd57b75f616e909a728bE945bBb";
const masterchef = "0xa72Aa0909f3471D2d360aBBc65B6D30fC7b51844";

module.exports = {
    deadFrom: 1648765747,
    ...masterChefExports(masterchef, "bsc", token, false)
}

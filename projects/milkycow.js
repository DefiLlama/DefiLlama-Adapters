const { masterChefExports } = require("./helper/masterchef");

const milko = "0xbd01b2CF2c514c7eC90827b8346354bb4f7832ab";
const masterchef = "0xA11213A5549629295bBfbc578CE5032266A5E827";

module.exports = {
  ...masterChefExports(masterchef, "milkomeda", milko, false)
};
const { masterChefExports } = require("./helper/masterchef")

const token = "0x4243cCC302A98B577678d87A53c75593199315A3";
const masterchef = "0x87F68799eB8fC579eDDC6381331882A3ee4e997e";

module.exports = {
    ...masterChefExports(masterchef, "fantom", token, false)
}; // node test.js projects/farmton.js
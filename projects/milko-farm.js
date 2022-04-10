const { masterChefExports } = require("./helper/masterchef");

const milko = "0x3c786134228b363fb2984619D7560AB56363B2bD";
const masterchef = "0x5d0C5db1D750721Ed3b13a8436c17e035B44c3D0";
const wada = "0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9";
const whitelist = [
  "0x3c786134228b363fb2984619D7560AB56363B2bD",
  "0xB44a9B6905aF7c801311e8F4E76932ee959c663C"
];

module.exports = {
    ...masterChefExports(masterchef, "milkomeda", milko, false)
}; // node test.js projects/milko-farm.js
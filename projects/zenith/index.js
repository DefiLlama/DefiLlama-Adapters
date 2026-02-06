const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const contracts = {
  "masterChef": "0xb9e7008FA856D66680BeE9E0a24da407D9d7fAD5",
  "stakePools": [
    "0x0000000000000000000000000000000000000000",
    "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    "0xae78736Cd615f374D3085123A210448E74Fc6393",
  ]
}


var pool2 = ['0xAC0155CBd306e41C1287E2c53e1306178397b823'];

module.exports = {
  methodology:
    "TVL is comprised of tokens deposited to Zenith protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.",
  ethereum: {
    pool2: pool2s([contracts.masterChef], pool2),
    tvl: stakings([contracts.masterChef], contracts.stakePools),
  },
};

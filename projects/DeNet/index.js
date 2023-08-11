const { sumTokensExport } = require("../helper/unwrapLPs");
const DE_TOKEN_ADDRESS = '0x081Ec4c0e30159C8259BAD8F4887f83010a681DC';

const owners = [
  '0xBA12222222228d8Ba445958a75a0704d566BF2C8', // balancer v2
  '0x54a59B0D4a068B9d9066604C25D242856e30b397', // uni DAI pool
  '0x771E6e817866434B6cf5f155E89AbEE0F39C0Ee0', // uni 1INCH  pool
  '0xd045f844F73A0c205e8cC0fc3e6C083f177c3b30', // uni MATIC pool
  '0x1a9b54A3075119f1546C52cA0940551A6ce5d2D0', // deposit in DeNet payments
]

module.exports = {
  start: 1691761595, // Friday, 11-Aug-23 13:46:35 UTC	
  methodology: "calculating TVL of DeNet file token $DE using on-chain method balanceOf on most popular liquidity pools",

  timetraver: true,
  misrepresentedTokens: false,

  polygon: {
    tvl: sumTokensExport({ 
      owners: owners,
      tokens: [DE_TOKEN_ADDRESS]
    }),
  }
};

 // LLAMA_DEBUG_MODE="true" node test.js projects/DeNet/index.js
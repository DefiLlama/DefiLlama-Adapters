const { gmxExports } = require("../helper/gmx");

const vault = "0x35C301Df78a6eD459931F56fBa6Cb2ad71bE606b";

module.exports = {
  iotaevm: {
    tvl: gmxExports({ vault}),
  },
};
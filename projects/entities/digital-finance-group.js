const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xEaf3B28A87D498530cDC7f0700E70502CF896D3f",
        "0x90FFFbbdf770eFB530d950C24bf56a292CDab3F7",
        "0xC71BaF5d8667FfF515246811a4f61350D26A191F",
        "0x36822AD3f4dF3E49EB042AFE74e43551d3c3Adba"
    ],
  },
  bsc: {
    owners: [
        "0xEaf3B28A87D498530cDC7f0700E70502CF896D3f",
        "0x2C20E739552cd0BEAF523930BAAD7754C426C962",
        "0x36822AD3f4dF3E49EB042AFE74e43551d3c3Adba",
        "0xC71BaF5d8667FfF515246811a4f61350D26A191F",
    ],
  },
  arbitrum: {
    owners: [
        "0xEaf3B28A87D498530cDC7f0700E70502CF896D3f",
        "0x2C20E739552cd0BEAF523930BAAD7754C426C962",
        "0x36822AD3f4dF3E49EB042AFE74e43551d3c3Adba",
        "0xC71BaF5d8667FfF515246811a4f61350D26A191F"
    ],
  },
}

module.exports = treasuryExports(config)
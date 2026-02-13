const {
  nullAddress,
  sumTokens2,
  sumTokensExport,
} = require("../helper/unwrapLPs");
const { stakingPriceLP } = require("../helper/staking");
const sdk = require("@defillama/sdk");
const { pool2 } = require("../helper/pool2");

// Contract addresses
const MegadropBBB = "0x37c00AE5C4b49Ab0F5fD2FFB1033588e9bC33B08"; // Megadrop BBB
const BBB = "0xfa4ddcfa8e3d0475f544d0de469277cf6e0a6fd1"; // BBB Token
const XDC_BBB_LP = "0x95ab47ff0056cdc81a42b35d96551d9c5534947d"; // XDC-BBB LP Token
const XDC_bpsXDC_LP = "0x51D8543C50eF5f07c5b4B8988E3048Ade31357d0"; // XDC-bpsXDC LP Token
const XDC_psXDC_LP = "0x3ff386092ee053397cadeba2ee273b4e40f06619";
const BBBPump = "0x2E24BFdE1EEDa0F1EA3E57Ba7Ff10ac6516ab5Ec"; // BBBPump
const lpStake = "0x2B3Bb9b3265Fcee484e857506fDCf2C0776E9c43";
const psXDC = "0x9B8e12b0BAC165B86967E771d98B520Ec3F665A6";
const bpsXDC = "0x24be372f0915b8BAf17AfA150210FFcB79C88845";
const xdcStake = "0x5af754f822CEd42deC729c1F1B3EDb9f13485ba7";

const owners = [BBBPump, xdcStake, lpStake];
const tokens = [nullAddress, XDC_BBB_LP, psXDC, bpsXDC, BBB, XDC_bpsXDC_LP];

module.exports = {
  start: "2024-10-10",
  xdc: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({
        owners,
        tokens,
        resolveLP: true,
      }),
    ]),
    staking: sdk.util.sumChainTvls([
      stakingPriceLP(MegadropBBB, BBB,  XDC_BBB_LP, "wrapped-xdc"),
      stakingPriceLP(lpStake, psXDC,  XDC_psXDC_LP, "wrapped-xdc"),
      stakingPriceLP(lpStake, bpsXDC,  XDC_bpsXDC_LP, "wrapped-xdc"),
    ]),
    pool2: sdk.util.sumChainTvls([
      pool2(lpStake, XDC_BBB_LP),
      pool2(lpStake, XDC_bpsXDC_LP),
    ]),
  },
};

// The provided address should be the all the BorrowingVaults and YieldVault contracts that returns
// totalAssets() for the indicated asset.
const polygonContracts = {
  weth: [
    "0xC9341E23F5C4d0E5248e6eBa558Dbc656Eee9CcC",
    "0x0099B99103069abEe2a05b6fa8B0F92FAd420EBF",
    "0x4588dfB3211Ec0fbC50c066d8a15E4BbAB82a4C3",
    "0x7fbC3d5b8AA825b12A0D90B6D8E13e6f2167510C",
  ],
  maticx: [
    "0xFCE906d3BAaD990262119bF9597B04A47325395b",
  ]
};

module.exports = {
  polygonContracts,
};
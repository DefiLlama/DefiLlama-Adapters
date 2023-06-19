const {
  marketSupply,
  marketDebt,
  WETH,
  MATICX,
  USDC,
  DAI
} = require('./utils');

// Collateral accounting by asset in all BorrowingVaults and YieldVault contracts
// using totalAssets() method.
const polygonVaultContracts = {
  weth: [
    "0xC9341E23F5C4d0E5248e6eBa558Dbc656Eee9CcC", // WETH-USDC-1
    "0x0099B99103069abEe2a05b6fa8B0F92FAd420EBF", // WETH-USDC-2
    "0x4588dfB3211Ec0fbC50c066d8a15E4BbAB82a4C3", // WETH-DAI-1
    "0x7fbC3d5b8AA825b12A0D90B6D8E13e6f2167510C", // WETH-DAI-2
  ],
  maticx: [
    "0xFCE906d3BAaD990262119bF9597B04A47325395b", // MATICX-USDC-1
  ]
};

// Debt accounting by debt asset in all BorrowingVaults contracts
// using totalDebt() method.
const polygonContractsDebt = {
  usdc: [
    "0xC9341E23F5C4d0E5248e6eBa558Dbc656Eee9CcC",
    "0x0099B99103069abEe2a05b6fa8B0F92FAd420EBF",
    "0xFCE906d3BAaD990262119bF9597B04A47325395b",
  ],
  dai: [
    "0x4588dfB3211Ec0fbC50c066d8a15E4BbAB82a4C3",
    "0x7fbC3d5b8AA825b12A0D90B6D8E13e6f2167510C",
  ]
};

async function polygonSupply(_timestamp, ethBlock, chainBlocks){
  const wethSupplies = await marketSupply(polygonVaultContracts.weth, chainBlocks.polygon, "polygon");
  const maticxSupplies = await marketSupply(polygonVaultContracts.maticx, chainBlocks.polygon, "polygon");

  return {
      [WETH]: wethSupplies,
      [MATICX]: maticxSupplies
  }
}

async function polygonDebt(_timestamp, ethBlock, chainBlocks){
  const usdcDebt = await marketDebt(polygonContractsDebt.usdc, chainBlocks.polygon, "polygon");
  const daiDebt = await marketDebt(polygonContractsDebt.dai, chainBlocks.polygon, "polygon");

  return {
      [USDC]: usdcDebt,
      [DAI]: daiDebt,
  }
}

module.exports = {
  polygonSupply,
  polygonDebt
};
const {
  marketSupply,
  marketDebt,
  WETH,
  USDC
} = require('./utils');

// Collateral accounting by asset in all BorrowingVaults and YieldVault contracts
// using totalAssets() method.
const gnosisVaultContracts = {
  weth: [
    "0x1f9137C0007341A78b83097027CE99cF540BD0E0", // WETH-USDC-1
  ],
};

// Debt accounting by debt asset in all BorrowingVaults contracts
// using totalDebt() method.
const gnosisContractsDebt = {
  usdc: [
    "0x1f9137C0007341A78b83097027CE99cF540BD0E0",
  ]
}

async function gnosisSupply(_timestamp, ethBlock, chainBlocks){
  const wethSupplies = await marketSupply(gnosisVaultContracts.weth, chainBlocks.xdai, "xdai");

  return {
      [WETH]: wethSupplies,
  }
}

async function gnosisDebt(_timestamp, ethBlock, chainBlocks){
  const usdcDebt = await marketDebt(gnosisContractsDebt.weth, chainBlocks.xdai, "xdai");

  return {
      [USDC]: usdcDebt,
  }
}

module.exports = {
  gnosisSupply,
  gnosisDebt
};
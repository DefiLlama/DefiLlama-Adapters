const {
  marketSupply,
  marketDebt,
  WETH,
  USDC,
  DAI
} = require('./utils');

// Collateral accounting by asset in all BorrowingVaults and YieldVault contracts
// using totalAssets() method.
const optimismVaultContracts = {
  weth: [
    "0x92964c1EeE607358CCCe7e8F53E7624eB8356f15", // WETH-USDC-1
    "0xe83A6D0aaA8765C30740C8D374604e4660735373", // WETH-USDC-2
    "0x0A9eFBC206401083D77508aCDDF2c407b7Aa7a61", // WETH-DAI-1
    "0x848fD325D928d8Eb7925A0e5F7fc05DE840D8d67", // WETH-DAI-2
  ],
};

// Debt accounting by debt asset in all BorrowingVaults contracts
// using totalDebt() method.
const optimismContractsDebt = {
  usdc: [
    "0x92964c1EeE607358CCCe7e8F53E7624eB8356f15",
    "0xe83A6D0aaA8765C30740C8D374604e4660735373",
  ],
  dai: [
    "0x0A9eFBC206401083D77508aCDDF2c407b7Aa7a61",
    "0x848fD325D928d8Eb7925A0e5F7fc05DE840D8d67",
  ]
};

async function optimismSupply(_timestamp, ethBlock, chainBlocks){
  const wethSupplies = await marketSupply(optimismVaultContracts.weth, chainBlocks.optimism, "optimism");

  return {
      [WETH]: wethSupplies,
  }
}

async function optimismDebt(_timestamp, ethBlock, chainBlocks){
  const usdcDebt = await marketDebt(optimismContractsDebt.usdc, chainBlocks.optimism, "optimism");
  const daiDebt = await marketDebt(optimismContractsDebt.dai, chainBlocks.optimism, "optimism");

  return {
      [USDC]: usdcDebt,
      [DAI]: daiDebt,
  }
}

module.exports = {
  optimismSupply,
  optimismDebt
};
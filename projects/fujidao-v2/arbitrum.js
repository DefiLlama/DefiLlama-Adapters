const {
  marketSupply,
  marketDebt,
  WETH,
  USDC,
  DAI,
  USDT
} = require('./utils');

// Collateral accounting by asset in all  BorrowingVaults and YieldVault contracts
// using totalAssets() method.
const arbitrumVaultContracts = {
  weth: [
    "0x9201E10E4C269D6528d2d153f2145348A399f540", // WETH-USDC-1
    "0x4181d63c414327682B1cb1d6265CA47d82C46e93", // WETH-USDC-2
    "0xA68DD672f0D52277a740a5f6864Bd3A0a30462f8", // WETH-DAI-1 
    "0xB9E7aCCb61031CA364C3232E986D9152b61006c2", // WETH-DAI-2
    "0xe2A42570C5b0d764f615368A50bE40EfB5D91D9A" // WETH-USDT-1
  ],
};

// Debt accounting by debt asset in all BorrowingVaults contracts
// using totalDebt() method.
const arbitrumContractsDebt = {
  usdc: [
    "0x9201E10E4C269D6528d2d153f2145348A399f540",
    "0x4181d63c414327682B1cb1d6265CA47d82C46e93",    
  ],
  dai: [
    "0xA68DD672f0D52277a740a5f6864Bd3A0a30462f8",
    "0xB9E7aCCb61031CA364C3232E986D9152b61006c2",
  ],
  usdt: [
    "0xe2A42570C5b0d764f615368A50bE40EfB5D91D9A"
  ]
}

async function arbitrumSupply(_timestamp, ethBlock, chainBlocks){
  const wethSupplies = await marketSupply(arbitrumVaultContracts.weth, chainBlocks.arbirtum, "arbitrum");

  return {
      [WETH]: wethSupplies,
  }
}

async function arbitrumDebt(_timestamp, ethBlock, chainBlocks){
  const usdcDebt = await marketDebt(arbitrumContractsDebt.usdc, chainBlocks.arbirtum, "arbitrum");
  const daiDebt = await marketDebt(arbitrumContractsDebt.dai, chainBlocks.arbirtum, "arbitrum");
  const usdtDebt = await marketDebt(arbitrumContractsDebt.usdt, chainBlocks.arbirtum, "arbitrum");

  return {
      [USDC]: usdcDebt,
      [DAI]: daiDebt,
      [USDT]: usdtDebt
  }
}

module.exports = {
  arbitrumSupply,
  arbitrumDebt
};
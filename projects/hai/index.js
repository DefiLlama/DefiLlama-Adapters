const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

// collateral addreses
const weth = ADDRESSES.optimism.WETH_1;
const op = ADDRESSES.optimism.OP;
const wsteth = ADDRESSES.optimism.WSTETH;

// collateral joins (contracts holding collaterals in the system)
const wethCollateralJoin = '0xbE57D71e81F83a536937f07E0B3f48dd6f55376B';
const opCollateralJoin = '0x994fa61F9305Bdd6e5E6bA84015Ee28b109C827A';
const wstethCollateralJoin = '0x77a82b65F8FA7da357A047B897C0339bD0B0B361';

module.exports = {
  start: 1709780769, // globalDebtCeiling raised > 0
  optimism: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [weth, wethCollateralJoin],
        [op, opCollateralJoin],
        [wsteth, wstethCollateralJoin]
      ]
    })
  }
};

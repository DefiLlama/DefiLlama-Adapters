const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Tokens
const EZETH = ADDRESSES.blast.ezETH;

// Lending pools
const LENDING_POOL_USDB = "0x4A1d9220e11a47d8Ab22Ccd82DA616740CF0920a";
const LENDING_POOL_WETH = "0x44f33bC796f7d3df55040cd3C631628B560715C2";

// Managers
const COLLATERAL_MANAGER = "0x6301795aa55B90427CF74C18C8636E0443F2100b";
const COLLATERAL_MANAGER_V2 = "0x105e285f1a2370D325046fed1424D4e73F6Fa2B0";
const WETH_COLLATERAL_MANAGER = "0x23eBa06981B5c2a6f1a985BdCE41BD64D18e6dFA";
const EZETH_COLLATERAL_MANAGER = "0xc81A630806d1aF3fd7509187E1AfC501Fd46e818";
const MUNCHABLE_WETH_COLLATERAL_MANAGER =
  "0x32b6C6322939263029A5CF37F14A59ab0A9E277c";

const wethCollateralManagers = [
  COLLATERAL_MANAGER,
  COLLATERAL_MANAGER_V2,
  WETH_COLLATERAL_MANAGER,
  MUNCHABLE_WETH_COLLATERAL_MANAGER,
].map((a) => [ADDRESSES.blast.WETH, a]);

async function tvl(api) {
  const tokens = await api.multiCall({
    abi: {
      inputs: [],
      name: "getTotalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    calls: [LENDING_POOL_USDB, LENDING_POOL_WETH],
  });

  api.add(ADDRESSES.blast.USDB, tokens[0]);
  api.add(ADDRESSES.blast.WETH, tokens[1]);

  await sumTokens2({
    api,
    resolveLP: true,
    tokensAndOwners: [
      [EZETH, EZETH_COLLATERAL_MANAGER],
      ...wethCollateralManagers,
    ],
  });
}

module.exports = {
  blast: {
    tvl,
  },
};

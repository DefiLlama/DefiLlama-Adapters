const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Tokens
const EZETH = ADDRESSES.blast.ezETH;

const PRO = {
  lendingPool: {
    usdb: "0x788654040D7E9a8Bb583D7d8CCEA1Ebf1AE4aC06",
    weth: "0x60ED5493B35f833189406dFec0b631A6B5B57f66",
  },
  collateralManager: {
    usdb: "0xaCe661Bf726Bd8aFE6F6594C559A5136489E64f9",
    weth: "0x4dEE8034019f03F1a025dbFB4bBC159D7BaA7a0A",
  },
}

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
const WEETH_COLLATERAL_MANAGER = 
  "0x7E4aFeBe294345d72dE6bB8405C871D7BB6c53d1";
const USDB_COLLATERAL_MANAGER =
  "0xC877B52c628Dba77fC55F1DDb140747155C9b39D";

const wethCollateralManagers = [
  COLLATERAL_MANAGER,
  COLLATERAL_MANAGER_V2,
  WETH_COLLATERAL_MANAGER,
  MUNCHABLE_WETH_COLLATERAL_MANAGER,
  PRO.collateralManager.weth,
].map((a) => [ADDRESSES.blast.WETH, a]);

const usdbCollateralManagers = [
  USDB_COLLATERAL_MANAGER,
  PRO.collateralManager.usdb,
].map((a) => [ADDRESSES.blast.USDB, a]);

async function tvl(api) {

  const thrusterV2LPs = [['0x4E4B4A3111d128628c427E78a2abAd1635fE6542', '0x4Ca392f74A4C86F5E521f1d8E915b36ed425B331']];
  const stakedLPCalls = thrusterV2LPs.map(lp => ({ params: [lp[1], lp[0]] }));
  const v2Bals = await api.multiCall({ abi: 'function staked(address, address) view returns (uint256)', calls: stakedLPCalls, target: '0xc3ecadb7a5fab07c72af6bcfbd588b7818c4a40e' });
  const v2Tokens = thrusterV2LPs.map(lp => lp[0]);
  api.add(v2Tokens, v2Bals);

  const tokens = await api.multiCall({
    abi: "uint256:getTotalSupply",
    calls: [LENDING_POOL_USDB, PRO.lendingPool.usdb, LENDING_POOL_WETH, PRO.lendingPool.weth],
  });

  api.add(ADDRESSES.blast.USDB, tokens[0]);
  api.add(ADDRESSES.blast.USDB, tokens[1]);
  api.add(ADDRESSES.blast.WETH, tokens[2]);
  api.add(ADDRESSES.blast.WETH, tokens[3]);

  await sumTokens2({
    api,
    resolveLP: true,
    tokensAndOwners: [
      [EZETH, EZETH_COLLATERAL_MANAGER],
      [ADDRESSES.blast.weETH, WEETH_COLLATERAL_MANAGER],
      ...usdbCollateralManagers,
      ...wethCollateralManagers,
    ],
  });
}

module.exports = {
  blast: {
    tvl,
  },
};

const ADDRESSES = require('../helper/coreAssets.json')

const vaults = [
  // sNXM (Nexus Mutual Strategy Vault)
  "0xD82c32Dd3585B5bc528688Efa408adA09963C238",
  // iNXM (Nexus Mutual Index Vault)
  "0xf4104CadE73d699922CC657A97CB1132bC620978",
];

/*
 * WNXM and NXM have different price at coingecko! what do I should use?
 * And in the vaults there are deposited both of them!
 */

const NXM = "0xd7c49CEE7E9188cCa6AD8FF264C1DA2e69D4Cf3B";

const erc20Tokens = [
  //WNXM
  "0x0d438f3b5175bebc262bf23753c1e53d03432bde",
  //IDLE
  "0x875773784Af8135eA0ef43b5a374AaD105c5D39e",
  //WETH
  ADDRESSES.ethereum.WETH,
  //VISR
  "0xf938424f7210f31df2aee3011291b658f872e91e",
  //BOND
  "0x0391D2021f89DC339F60Fff84546EA23E337750f",
];

/*** Vaults and staking TVL Portions ***/
const ethTvl = async (api) => {
  const supplies = await api.multiCall({  abi: 'erc20:totalSupply', calls: vaults})
  api.add(NXM, supplies)
  return api.sumTokens({ owners: vaults, tokens: erc20Tokens})
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology:
    "We count liquidity of NXM/WNXM deposited on the vaults (iNXM and sNXM) threw their contracts and the staking of other tokens within these vaults",
};

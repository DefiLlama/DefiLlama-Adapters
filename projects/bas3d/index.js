const abi = require("./abi.json");
const { sumTokensExport, sumUnknownTokens } = require('../helper/unknownTokens')

const coreRewards = "0x3a7D3D2b49CAA7EF2C116C64711265eab0C755c0";
const ethRewards = "0x5EeA01cDCAF548e639B9B5d66FBcbeD2a2a12beD";
const BAS3D = "0xC4743d049891ea4333F8b559D09a93c3511f0762";

const vaults = [
  //BaseSwap.fi ETH/USDC
  "0x2BF271D886febBc072087cDCB014Ae0dE8897c76",

  //BaseSwap.fi BSWAP/ETH
  "0x106FB0C0c2e7249B36af8f0EdcBcc85CA82031Ea",

  //BaseSwap.fi DAI/USDC
  "0x8Fff31D7601A279F7D83b38f83a0bf62c384Eb4A",
];

/*** Staking of native token BAS3D and BAS3D/ETH LP TVL Portion ***/
const pool2 = async (api) => {
  const staking_lpToken = await api.call({ abi: abi.stakingToken, target: coreRewards, })
  return sumUnknownTokens({ api, tokens: [staking_lpToken], owners: [coreRewards, ethRewards], useDefaultCoreAssets: true })
};


/*** vaults TVL portion ***/
const bas3dTVL = async (api) => {
  const tokens = await api.multiCall({  abi: abi.LPtoken, calls: vaults})
  const bals = await api.multiCall({  abi: abi.balanceLPinSystem, calls: vaults})
  api.addTokens(tokens, bals)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true, })
};

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  base: {
    tvl: bas3dTVL,
    staking: sumTokensExport({ owners: [coreRewards, ethRewards], tokens: [BAS3D], useDefaultCoreAssets: true, lps: ['0xfD77Af39aA9802fCc4c7933DA9754D9edB14afC0'] }),
    pool2,
  },
  methodology: `TVL is counted from the deposits into our yield farm and vaults`,
};

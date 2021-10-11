const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { transformPolygonAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

// Contracts
const assetManager = "0xA2b6eC586F989cf1C055B7C9D16fDdA80FDD679b";
const sellerContract = "0xc73C6C3e80C28dBc55F65bBdC895E828bb98C72d";
const stakingContract = "0x21edB57A75ee69BCe0Fe3D0EfC5674bcF1D5BF93";

// Tokens
const USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const TIDAL = "0xB41EC2c036f8a42DA384DDE6ADA79884F8b84b26";

/*** Staking of native token (TIDAL) TVL portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformPolygonAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    [[TIDAL, false]],
    [stakingContract],
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  return balances;
};

/*** Polygon TVL Portions ***/
const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const lengthOfAssets = (
    await sdk.api.abi.call({
      abi: abi.getAssetLength,
      target: assetManager,
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output;

  for (let i = 0; i < lengthOfAssets; i++) {
    const BalanceOfAsset = (
      await sdk.api.abi.call({
        abi: abi.assetBalance,
        target: sellerContract,
        params: i,
        chain: "polygon",
        block: chainBlocks["polygon"],
      })
    ).output;

    sdk.util.sumSingleBalance(balances, `polygon:${USDC}`, BalanceOfAsset);
  }

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking,
  },
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([polygonTvl]),
  methodology:
    "We count liquidity of USDC Reserve deposited on the pool threw Seller contract; and the staking of native token",
};

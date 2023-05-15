const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { getUniTVL } = require('../helper/unknownTokens')
const { compoundExports } = require('../helper/compound')
const { getConfig } = require('../helper/cache')

const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");

const abi = require("./abi.json");

const url = "https://api.bdollar.fi/api/bvault/get-vaults";

const BDEX_FACTORY = "0x2C358A7C62cdb9D554A65A86EEa034bc55D1E715";
const COMPTROLLER = "0xEEea0D4aAd990c4ede8e064A8Cb0A627B432EDa0";
const wBNB = ADDRESSES.bsc.WBNB;
const cBNB = "0xa3948b027f94ca195eac645746435aaa7eb555a7";
const chain = 'bsc'

async function yieldTVL(timestamp, chainBlocks) {
  let balances = {};

  // --- bVaults & bDollar TVL section, all contract addresses grab from endpoint ---
  // --- Sections of boardroom is not considered in TVL (bDollar Shares related) ---
  let vaultsInfo = (await getConfig('bearn-fi', url)).data.vaultInfos;

  const keys = Object.keys(vaultsInfo);

  const strategies = [];

  keys.forEach((key) => {
    strategies.push({
      address: vaultsInfo[key].strategy,
      token: vaultsInfo[key].token,
    });
  });

  let wantedLocked = (
    await sdk.api.abi.multiCall({
      block: chainBlocks["bsc"],
      calls: strategies.map((strategy) => ({ target: strategy.address })),
      abi: abi.wantLockedTotal,
      chain: "bsc",
    })
  ).output.map((el) => el.output);

  let wantedAddresses = (
    await sdk.api.abi.multiCall({
      block: chainBlocks["bsc"],
      calls: strategies.map((strategy) => ({ target: strategy.address })),
      abi: abi.wantAddress,
      chain: "bsc",
    })
  ).output.map((el) => el.output);

  const transformAdress = await getChainTransform(chain);

  const lpPositions = [];

  strategies.map((strategy, idx) => {
    if (
      strategy.token.includes("CakeLP") ||
      strategy.token.includes("CLP") ||
      strategy.token.includes("vBSWAP") ||
      strategy.token.includes("VLP") && strategy.token !== "VLP_BDO_VDOLLAR"
    ) {
      lpPositions.push({
        token: wantedAddresses[idx],
        balance: wantedLocked[idx],
      });
    } else {
      // apparently this strategy in the endpoint states 0 tvl, so it is filter out
      if (!strategy.token.includes("ibBUSD")) {
        sdk.util.sumSingleBalance(
          balances,
          `bsc:${wantedAddresses[idx]}`,
          wantedLocked[idx]
        );
      }
    }
  });

  await unwrapUniswapLPs(balances, lpPositions, chainBlocks["bsc"], "bsc", transformAdress);
  return balances;
}

const cExports = compoundExports(COMPTROLLER, chain, cBNB, wBNB,)

const dexTVL = getUniTVL({
  chain,
  factory: BDEX_FACTORY,
  useDefaultCoreAssets: true,
})


module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([yieldTVL, dexTVL, cExports.tvl]),
    borrowed: cExports.borrowed,
  },
};

const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { getUniTVL } = require('../helper/unknownTokens')
const { compoundExports } = require('../helper/compound')
const { getConfig } = require('../helper/cache')

const { sumTokens2 } = require("../helper/unwrapLPs");

const url = "https://api.bdollar.fi/api/bvault/get-vaults";

const BDEX_FACTORY = "0x2C358A7C62cdb9D554A65A86EEa034bc55D1E715";
const COMPTROLLER = "0xEEea0D4aAd990c4ede8e064A8Cb0A627B432EDa0";
const wBNB = ADDRESSES.bsc.WBNB;
const cBNB = "0xa3948b027f94ca195eac645746435aaa7eb555a7";

async function yieldTVL(api) {
  // --- bVaults & bDollar TVL section, all contract addresses grab from endpoint ---
  // --- Sections of boardroom is not considered in TVL (bDollar Shares related) ---
  let vaultsInfo = (await getConfig('bearn-fi', url)).data.vaultInfos;

  const keys = Object.keys(vaultsInfo);

  const strategies = []

  keys.forEach((key) => {
    if (vaultsInfo[key].token !== "ibBUSD")
      strategies.push(vaultsInfo[key].strategy)
  });
  const bals = await api.multiCall({ abi: "uint256:wantLockedTotal", calls: strategies })
  const tokens = await api.multiCall({ abi: "address:wantAddress", calls: strategies })

  api.add(tokens, bals)
  return sumTokens2({ api, resolveLP: true })
}

const cExports = compoundExports(COMPTROLLER, cBNB, wBNB,)

const dexTVL = getUniTVL({
  factory: BDEX_FACTORY,
  useDefaultCoreAssets: true,
})


module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([yieldTVL, dexTVL, cExports.tvl]),
    borrowed: cExports.borrowed,
  },
};

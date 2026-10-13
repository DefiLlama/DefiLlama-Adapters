const { treasuryExports } = require("../helper/treasury");

const PUMPER = "0xd86800D5b021F5D79350C2F742Bbb1ecc010Bf82";
const USDT0 = "0x779Ded0c9e1022225f8E0630b35a9b54bE713736";
const WGUSDT = "0x817997Ca8394E26CCE3dE3A076a4889b27DbF9dE";
const NATIVE = "0x0000000000000000000000000000000000000000";

const exportObj = treasuryExports({
  stable: {
    owners: [
      "0x88417F6cF37DAf2055f325B9de4498B8da2f4359", // PumperTreasuryVaultV3
      "0x3d641ad57af4cFb9C354e7554dDbcf29033b699A", // PumperTreasuryVault V2 (abandoned)
      "0x5198a9A0c4f44f1494d4931697cC693CA3673320", // PumperTreasuryVault V1
      "0x600191784c1F56fE1930Cb9A084c23d47d76aDD6", // PumperTreasuryVault V2
      "0xD3173b0CC00FAAdb8D3FBF9035DA2B26491eC170", // PumperTreasuryVault V2 (abandoned)
      "0xF4F918bdc3B4e2717D05034C8a079c5c1Ae3d7Ee", // PumperTreasuryVault V2 (abandoned)
      "0xb961cE542585F15DC447eF97a11A3392DbD11F06", // admin vault (10% launchpad cut)
    ],
    tokens: [
      USDT0,
      WGUSDT,
    ],
    ownTokens: [PUMPER],
    resolveUniV3: true,
  },
});

// Report every stablecoin as USDT0: on Stable, USDT0 held by a contract is read
// as the native gas balance (18dp), and WgUSDT is an 18dp 1:1 wrapper of USDT0.
const baseTvl = exportObj.stable.tvl;
exportObj.stable.tvl = async (api) => {
  await baseTvl(api);
  const balances = api.getBalances();
  let extra = 0;
  // the same token can appear under differently-cased keys (checksummed vs lowercase)
  const keys = [NATIVE, WGUSDT].map((t) => `stable:${t.toLowerCase()}`);
  for (const key of Object.keys(balances).filter((k) => keys.includes(k.toLowerCase()))) {
    extra += Number(balances[key]) / 1e12;
  }
  for (const token of [NATIVE, WGUSDT]) api.removeTokenBalance(token);
  if (extra) api.add(USDT0, extra);
  return api.getBalances();
};

module.exports = exportObj;

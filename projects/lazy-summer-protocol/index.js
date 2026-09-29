const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  ethereum: ["0x09eb323dBFECB43fd746c607A9321dACdfB0140F"],
  base: ["0x09eb323dBFECB43fd746c607A9321dACdfB0140F"],
  arbitrum: ["0x09eb323dBFECB43fd746c607A9321dACdfB0140F", "0x7fBfb946cA4ba96559467E84ef41DA6cfE0C9a17"],
  sonic: ["0xa8E4716a1e8Db9dD79f1812AF30e073d3f4Cf191"],
  hyperliquid: ["0x5CD5D7e3A1b604E0EdeDc4A2343b312729e09E3F"],
};

// The protocol's vault (FleetCommander) share accounting was compromised, so we
// cannot trust its totalAssets/convertToAssets. Instead we value TVL bottom-up:
// each FleetCommander deploys funds into "Arks" (strategy adapters), and every
// Ark holds the receipt/position token of the external protocol it deposits into
// (Aave aToken, Compound comet, Moonwell mToken, Morpho/Euler/Fluid/Sky ERC4626
// shares, Silo shares, Spark spToken, Origin OUSD/OETH ...). We read each Ark's
// actual on-chain token holdings and let DefiLlama price/unwrap them.

// getters on an Ark that return the external receipt token it holds
const RECEIPT_GETTERS = ["aToken", "comet", "mToken", "metaMorpho", "susds", "vault", "spToken", "usds", "silo", "arm"];

// tokens some Arks hold directly (no getter) — Origin rebasing tokens
const EXTRA_HELD_TOKENS = {
  ethereum: [
    "0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86", // OUSD
    "0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3", // OETH
  ],
  base: [
    "0xDBFeFD2e8460a6Ee4955A68582F85708BAEA60A3", // superOETHb
  ],
};

// Compromised receipt tokens whose on-chain accounting is inflated: they report
// totalAssets they do not actually hold, so pricing/unwrapping them (at any depth)
// would count phantom value. Excluded from the valuation.
//   vgUSDC (Silo "Varlamore USDC Growth") deposits into Silo market bUSDC-155,
//   which claims ~$630M USDC while holding 0 USDC — the exploited leaf.
const BLACKLISTED_TOKENS = {
  ethereum: [
    "0x8399C8Fc273bD165C346Af74A02e65f10e4FD78F", // vgUSDC
    "0x1dE3bA67Da79A81Bc0c3922689c98550e4bd9bc2", // bUSDC-155 (fake Silo market)
  ],
};

const NULL_ADDRESS = ADDRESSES.null;

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = (await api.multiCall({ abi: "address[]:getActiveFleetCommanders", calls: config[chain] })).flat();
      const arks = (await api.multiCall({ abi: "address[]:getActiveArks", calls: vaults, permitFailure: true })).filter(Boolean).flat();

      // resolve the receipt token each ark holds
      const receiptByGetter = {};
      for (const g of RECEIPT_GETTERS)
        receiptByGetter[g] = await api.multiCall({ abi: `address:${g}`, calls: arks, permitFailure: true });

      const tokensAndOwners = [];
      const undetectedArks = [];
      arks.forEach((ark, i) => {
        const getter = RECEIPT_GETTERS.find((g) => receiptByGetter[g][i] && receiptByGetter[g][i] !== NULL_ADDRESS);
        if (getter) tokensAndOwners.push([receiptByGetter[getter][i], ark]);
        else undetectedArks.push(ark);
      });

      // fallback for arks without a recognised receipt getter: value the assets
      // they hold directly (their underlying asset + known Origin tokens)
      const assets = await api.multiCall({ abi: "address:asset", calls: undetectedArks, permitFailure: true });
      undetectedArks.forEach((ark, i) => {
        if (assets[i]) tokensAndOwners.push([assets[i], ark]);
        for (const token of EXTRA_HELD_TOKENS[chain] || []) tokensAndOwners.push([token, ark]);
      });

      return sumTokens2({ api, tokensAndOwners, resolveAll: true, blacklistedTokens: BLACKLISTED_TOKENS[chain] });
    },
  };
});

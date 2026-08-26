const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

// One stateless ProtocolLens per deployment (docs: https://dexlaunch.fun/docs, "Deployed
// contracts"); it resolves every downstream singleton through the SaleFactory per call.
const config = {
  robinhood: {
    lens: "0x99572E63B8C8C64D42Dba1Be1e2f78AD9cD6FC1d",
    wnative: ADDRESSES.robinhood.WETH,
  },
  hyperliquid: {
    lens: "0x5aF7A226F75AF0F0bA99DFdaE05D7167e5B1fc16",
    wnative: ADDRESSES.hyperliquid.WHYPE,
  },
};

const abi = {
  getTvlSources: "function getTvlSources() view returns (tuple(address locker, address[] lockerTokens, address[] v3Managers, uint256[] v3PositionIds, address pad, uint256 padEthWei, address[] sales, address[] saleFundingTokens))",
};

async function tvl(api) {
  const { lens, wnative } = config[api.chain];
  const src = await api.call({ target: lens, abi: abi.getTvlSources });

  // 1. Bonding-curve pad: exact native backing of live curves.
  api.add(ADDRESSES.null, src.padEthWei);

  // 2. Locked graduation LP + every sale's funding asset.
  const ownerTokens = [[src.lockerTokens, src.locker]];
  src.sales.forEach((sale, i) => ownerTokens.push([[src.saleFundingTokens[i]], sale]));

  // 3. Locked V3 positions, priced by position id (one manager per deployment in practice).
  const uniV3ExtraConfig = src.v3PositionIds.length
    ? { nftAddress: src.v3Managers[0], positionIds: src.v3PositionIds }
    : undefined;

  return sumTokens2({
    api,
    ownerTokens,
    resolveLP: true,
    resolveUniV3: Boolean(uniV3ExtraConfig),
    uniV3ExtraConfig,
    uniV3WhitelistedTokens: [wnative],
  });
}

module.exports = {
  methodology:
    "TVL is the native asset held by live bonding curves (ProtocolLens.getPadEthTvl), wrapped-native locked in the shared TokenLocker (LP unwrapped to underlyings; locked graduation LP included; V3 positions priced by id), and each active presale's funding-asset balance. Same lens-driven sources on every deployed chain.",
  start: '2026-08-01',
};
Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});

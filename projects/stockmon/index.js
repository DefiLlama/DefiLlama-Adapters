// STOCKMON — stock-DNA creature NFTs whose token IDs own exact onchain Vault
// subledgers of Robinhood Chain stock tokens plus WETH pending fills.
// TVL is the exact token balances held by STOCKMON vaults; nothing is
// self-reported. Site: https://stockmon.app

// Vaults by collection — Aetheryn joins this list when its vault deploys.
const VAULTS = [
  "0xb78edcb4de39355747c62e6d55209c01a2294ad8", // Genesis Vault
];

const WETH = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73";

// Canonical Robinhood Chain stock-token deployments (Robinhood registry).
const STOCK_TOKENS = [
  "0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC", // NVDA
  "0x322F0929c4625eD5bAd873c95208D54E1c003b2d", // TSLA
  "0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3", // GOOGL
  "0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9", // AAPL
  "0xe93237C50D904957Cf27E7B1133b510C669c2e74", // MSFT
  "0x12f190a9F9d7D37a250758b26824B97CE941bF54", // AMZN
  "0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35", // META
  "0x894E1EC2D74FFE5AEF8Dc8A9e84686acCB964F2A", // PLTR
  "0x117cc2133c37B721F49dE2A7a74833232B3B4C0C", // SPY
  "0xD5f3879160bc7c32ebb4dC785F8a4F505888de68", // QQQ
  "0x4a0E65A3EcceC6dBe60AE065F2e7bb85Fae35eEa", // SPCX (SpaceX)
  "0x4D21483a44Bf67a86b77E3dA301411880797D452", // BA
  "0xB1BF26c1D20ff267A4f93550d1E0d06ac40a114B", // RIVN
  "0xF0AB0c93bE6F41369d302e55db1A96b3c430212D", // IREN
  "0x284358abc07F9359f19f4b5b4aC91901Be2597Ba", // RGTI
  "0xC583c60aeF9Dc401Da72cEC1B404743a93cea1Cc", // QBTS
];

module.exports = {
  methodology:
    "TVL is the exact onchain balances held by STOCKMON vaults on Robinhood Chain: the 16 Robinhood stock tokens backing each creature's permanent stock DNA, plus WETH pending settlement into stock fills. Balances are read directly from the vault contracts; no value is self-reported.",
  robinhood: {
    tvl: (api) =>
      api.sumTokens({
        owners: VAULTS,
        tokens: [WETH, ...STOCK_TOKENS],
      }),
  },
};

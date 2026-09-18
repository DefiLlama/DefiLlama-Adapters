// DefiLlama TVL adapter for PARE — goes in DefiLlama-Adapters/projects/pare/index.js
// TVL = stock tokens held by each StripVault (the split principal + yield backing).
// Uniswap pool liquidity and Morpho lending are counted by those protocols, not here.
const { sumTokens2 } = require("../helper/unwrapLPs");

const VAULTS = {
  // audited build, 2026-09-18, maturity 2027-12-31
  "0x131179E65Ab5C0538f5191920233Fd9Dc31930d1": "0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9", // AAPL-DEC27
  "0xa0f77015E46e45c1A12B73466A08711a28Dac1A7": "0x117cc2133c37B721F49dE2A7a74833232B3B4C0C", // SPY-DEC27
  "0xAb8e536C9E7c76C1045EDEb6096e9B37B26B4372": "0xD5f3879160bc7c32ebb4dC785F8a4F505888de68", // QQQ-DEC27
  "0x1aC9599B91973A3d5d75F7594a47382223FEC0F5": "0x7066A64c24e4206CD62E83bf198c1E7EB361F51e", // PFE-DEC27
  "0x1d44BB0E2D09C35Cc116270E45F8782E7B51fF52": "0x92FD66527192E3e61d4DDd13322Aa222DE86F9B5", // SGOV-DEC27
  // launch build, 2026-09-02..04, still redeemable
  "0x4C3B4CDd55b2E9e60eefcD93234A77D4AD53e365": "0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9", // AAPL-MAR27
  "0x38EAE2c04F65861cD17914100125826de2b735c7": "0x117cc2133c37B721F49dE2A7a74833232B3B4C0C", // SPY-MAR27
  "0x16daFbB03C4EF20967043185255532A8cadf79Ba": "0xD5f3879160bc7c32ebb4dC785F8a4F505888de68", // QQQ-MAR27
  "0x0Fd9c2DCABf7780D051a519c654eb13Afec5a975": "0x7066A64c24e4206CD62E83bf198c1E7EB361F51e", // PFE-MAR28
  "0x3a6A3621C42A68fcA176AB907AB25896484EcCD8": "0xd63ABB2C13d7a8421a8017a712802053568e3C1D", // SCHD-MAR27
};

const tokensAndOwners = Object.entries(VAULTS).map(([vault, stock]) => [stock, vault]);

module.exports = {
  methodology:
    "Stock Tokens deposited in PARE StripVaults on Robinhood Chain. Each vault holds the stock backing one series of principal (pToken) and yield (yToken) tokens until maturity.",
  start: "2026-09-02",
  robinhood: {
    tvl: (api) => sumTokens2({ api, tokensAndOwners }),
  },
};

const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

// ── Tokens ──
const WETH  = ADDRESSES.ethereum.WETH;
const USDC  = ADDRESSES.ethereum.USDC;
const USDT  = ADDRESSES.ethereum.USDT;
const ZCHF  = "0xB58E61C3098d85632Df34EecfB899A1Ed80921cB";
const enUSD = "0xbaA433574b33ff48dB1eCBc805eC2e4f3113Aab8";
const enCHF = "0x48F062b9d07056b206Ff5BA3A18270C2e2aDdecb";
const ENNI  = "0xE364450b3F702d12b02F0290E0392f02DE53b8E2";

// ── Protocol ──
const CDP_USD         = "0x2DBa9be6A0A62428f8158ef6775b4dB67693e6a9";
const CDP_CHF         = "0x8AD59EC3Ea144f43Fa1AaC08509fC95dA17E717b";
const DIRECT_MINT     = "0xa25AB106aA34581fCeF0cb4483033f1663AeDF67";
const DIRECT_MINT_CHF = "0xa4C209C1173ae57a4A34FAf3797F3E3381497163";
const SAVINGS_USD     = "0xED301b687a01634c33e87412190Ca73139f3F305";
const SAVINGS_CHF     = "0xa01f76c33Dd24C351DC3F5B210c532CCC44b1457";
const MASTER_CHEF     = "0x428160D0B951017acF534D8B20f656D119B0bD5D";

// ── LP tokens ──
const ENNI_USDC_LP = "0x9B2Bf44022a57faD4B061E5FB4875142e34A675B";

// ── Core TVL ──
async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      [WETH, CDP_USD],
      [WETH, CDP_CHF],
      [USDC, DIRECT_MINT],
      [USDT, DIRECT_MINT],
      [ZCHF, DIRECT_MINT_CHF],
    ],
  });
}

// ── Staking (ENNI in MasterChef pool 0, includes Vault deposits) ──
async function staking(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      [ENNI, MASTER_CHEF],
    ],
  });
}

// ── Pool2 (ENNI-USDC LP in MasterChef pool 1) ──
async function pool2(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      [ENNI_USDC_LP, MASTER_CHEF],
    ],
    resolveLP: true,
  });
}

module.exports = {
  methodology:
    "TVL counts WETH collateral in CDP contracts, USDC/USDT reserves in DirectMint, ZCHF reserves in DirectMintGeneric, and enUSD/enCHF deposited in Savings. ENNI staked in MasterChef (including via Vault) is counted as staking. ENNI-USDC LP in MasterChef is counted as pool2.",
  ethereum: {
    tvl,
    staking,
    pool2,
  },
};

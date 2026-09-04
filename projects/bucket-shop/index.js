// DefiLlama adapter for Bucket Shop (Robinhood Chain).
// Submit as projects/bucket-shop/index.js in DefiLlama/DefiLlama-Adapters.
//
// TVL counted, conservatively:
//  - Treasury's native ETH (fees accumulated toward the next buy round)
//  - Distributor's tokenized-equity balances awaiting payout (the stocks
//    bought for holders but not yet distributed)
// NOT counted: the locked LP position (Uniswap v4 singleton positions are
// where DefiLlama's uniswap adapter already counts pool liquidity; counting
// LpLock again would double count), holder wallets, or NFT accounts.
//
// Robinhood Chain is an Arbitrum Orbit L2; chain key per DefiLlama's chain
// registry (add the chain first if not yet listed there).

const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const chain = "robinhood"; // adjust to DefiLlama's registered chain key

const TREASURY = "0xe211898a898e5788878C91A1e458F3FFF3A8dD92";
const DISTRIBUTOR = "0x30f3916201E49bD6e5f47566BB59a68e6cEdE5C5";
// v2 basket vaults: hold the stock backing for outstanding bucket-share
// tokens (fully backed by construction; redemption is permissionless).
const V2_VAULTS = [
  "0xd6d9e6e40dec4bbae488fe18c976a62343c8e7cb", // bCORE
  "0x6e15d611f0c201a8c15b4d2f31aa2c1472d3328b", // bTECH
  "0x465BB16d3d56Fb87f65638Cbc93C76C70Bd8A09F", // bCHIPS
  "0xbe98fc594685ede92a364e0bd45cc09840c961bf", // bDEGEN
  "0xa69f33df17bcf3a3260a11a27fc2250b9efc6d1e", // bMKT
  "0x86d4b4a88ef887c853dc27244bb60724ca7c8cab", // bCRYPTO
];
const SERIES_C_SEAT = "0x95f3918c586b477b9ff401ce6658ff7437a9dca5"; // holds ETH for card revenue seats

// Registered payout assets (tokenized equities + crypto) held by the
// Distributor between buy rounds and payouts.
const PAYOUT_ASSETS = [
  "0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9","0x4a0E65A3EcceC6dBe60AE065F2e7bb85Fae35eEa",
  "0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC","0x894E1EC2D74FFE5AEF8Dc8A9e84686acCB964F2A",
  "0x322F0929c4625eD5bAd873c95208D54E1c003b2d","0xff080c8ce2e5feadaca0da81314ae59d232d4afd",
  "0x05b37fb53a299a1b874a619e1c4c404d52c36f4c","0x4ea005168d7f09a7a0ba9d1def21a479950e44c2",
  "0xec262a75e413fafd0df80480274532c79d42da09","0x86923f96303d656e4aa86d9d42d1e57ad2023fdc",
  "0xE0444EF8BF4eD74f74FD73686e2ddF4C1c5591E8","0x117cc2133c37B721F49dE2A7a74833232B3B4C0C",
  "0xe93237C50D904957Cf27E7B1133b510C669c2e74","0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3",
  "0x1b0E319c6A659F002271B69dB8A7df2F911c153E","0x6330D8C3178a418788dF01a47479c0ce7CCF450b",
  "0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35","0xB90A19fF0Af67f7779afF50A882A9CfF42446400",
  "0x12f190a9F9d7D37a250758b26824B97CE941bF54","0x48E39E56aCdbA37b09020C0b734A613C9a2f100A",
  "0xdF0992E440dD0be65BD8439b609d6D4366bf1CB5","0x5f10A1C971B69e47e059e1dC91901B59b3fB49C3",
  "0x941AE714EC6D8130c7B75d67160Ca08f1e7d11Dd","0x1D11f0496982706C5e14A514D4E79F2e6BdE4516",
  "0xCceE82fE024c36fA15E1005edE3E9e4787e23D09","0xc72b96e0E48ecd4DC75E1e45396e26300BC39681",
  "0xb0992820E760d836549ba69BC7598b4af75dEE03","0xD5f3879160bc7c32ebb4dC785F8a4F505888de68",
  "0x59818904ab4cE163b3cE4FfB64f2D6Ca02c434B4","0xF0C4BF4C582cb3836e98394b1d4e7B7281101bE8",
  "0x58FfE4a942d3885bAa22D7520691F611EF09e7AA","0x5e81213613b6B86EaB4c6c50d718d34359459786",
  "0xa30FA36Db767ad9eD3f7a60fC79526fB4d56D344","0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
  "0xc6911796042b15d7Fa4F6CDe69e245DdCd3d9c31","0xe934e36A439C94017B64a3FecE66AF12099aBF50",
  "0x020bfC650A365f8BB26819deAAbF3E21291018b4","0x39dBED3a2bd333467115dE45665cC57F813C4571",
  "0xCA9c78Dd337A67F6e0077F65F5E9218719d30eDf","0x0bd7d308f8e1639fab988df18a8011f41eacad73",
  "0x2E8c31162b855A2ffa90F6F8634643Ad6F111e18",
];

module.exports = {
  methodology:
    "TVL = native ETH held by the Treasury (accumulated fees awaiting the next asset buy) and by the SeriesCRevenueSeat (card revenue awaiting claims), plus tokenized-equity and crypto balances held by the Distributor awaiting payout and by the v2 basket vaults as backing for outstanding bucket-share tokens. Locked LP is excluded to avoid double counting Uniswap v4 pool liquidity.",
  [chain]: {
    tvl: sumTokensExport({
      // explicit pairs, not an owners x tokens product: native ETH only
      // where ETH actually accrues, payout assets only where they are held
      tokensAndOwners: [
        [ADDRESSES.null, TREASURY],
        [ADDRESSES.null, SERIES_C_SEAT],
        ...PAYOUT_ASSETS.map((t) => [t, DISTRIBUTOR]),
        ...V2_VAULTS.flatMap((v) => PAYOUT_ASSETS.map((t) => [t, v])),
      ],
    }),
  },
};

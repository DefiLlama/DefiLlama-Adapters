// v0.8.15 Cellars (Cellar 1.0)
const CELLAR_AAVE = "0x7bad5df5e11151dc5ee1a648800057c5c934c0d5";
const cellarsV0815 = [{ id: CELLAR_AAVE, startBlock: 15057867 }];

// v0.8.16 Cellars (Cellar 1.5)
const ETH_BTC_TREND = "0x6b7f87279982d919bbf85182ddeab179b366d8f2";
const ETH_BTC_MOM = "0x6e2dac3b9e9adc0cbbae2d0b9fd81952a8d33872";
const STEADY_ETH = "0x3f07a84ecdf494310d397d24c1c78b041d2fa622";
const STEADY_BTC = "0x4986fd36b6b16f49b43282ee2e24c5cf90ed166d";
const STEADY_UNI = "0x6f069f711281618467dae7873541ecc082761b33";
const STEADY_MATIC = "0x05641a27c82799aaf22b436f20a3110410f29652";
const cellarsV0816 = [
  { id: ETH_BTC_TREND, startBlock: 15733768 },
  { id: ETH_BTC_MOM, startBlock: 15733768 },
  { id: STEADY_ETH, startBlock: 15991609 },
  { id: STEADY_BTC, startBlock: 15991609 },
  { id: STEADY_UNI, startBlock: 16192732 },
  { id: STEADY_MATIC, startBlock: 16192732 },
];

// v2 Cellars
const DEFI_STARS = "0x03df2a53cbed19b824347d6a45d09016c2d1676a";
const REAL_YIELD_USD = "0x97e6e0a40a3d02f12d1cec30ebfbae04e37c119e";
const REAL_YIELD_ETH = "0xb5b29320d2dde5ba5bafa1ebcd270052070483ec";
const REAL_YIELD_LINK = "0x4068bdd217a45f8f668ef19f1e3a1f043e4c4934";
const REAL_YIELD_1INCH = "0xc7b69e15d86c5c1581dacce3cacaf5b68cd6596f";
const REAL_YIELD_UNI = "0x6a6af5393dc23d7e3db28d28ef422db7c40932b6";
const REAL_YIELD_SNX = "0xcbf2250f33c4161e18d4a2fa47464520af5216b5";
const REAL_YIELD_ENS = "0x18ea937aba6053bc232d9ae2c42abe7a8a2be440";
const REAL_YIELD_BTC = "0x0274a704a6d9129f90a62ddc6f6024b33ecdad36";
const FRAXIMAL = "0xdbe19d1c3f21b1bb250ca7bdae0687a97b5f77e6";

const cellarsV2 = [
  { id: DEFI_STARS, startBlock: 17181497 },
  { id: REAL_YIELD_USD, startBlock: 16431804 },
  { id: REAL_YIELD_ETH, startBlock: 16986127 },
  { id: REAL_YIELD_LINK, startBlock: 17377190 },
  { id: REAL_YIELD_1INCH, startBlock: 17377190 },
  { id: REAL_YIELD_UNI, startBlock: 17377190 },
  { id: REAL_YIELD_SNX, startBlock: 17377190 },
  { id: REAL_YIELD_ENS, startBlock: 17377190 },
  { id: REAL_YIELD_BTC, startBlock: 17667535 },
  { id: FRAXIMAL, startBlock: 17589948 },
];

// v2.5 Cellars
const TURBO_SWETH = "0xd33dad974b938744dac81fe00ac67cb5aa13958e";
const TURBO_GHO = "0x0c190ded9be5f512bd72827bdad4003e9cc7975c";
const ETH_GROWTH = "0x6c51041a91c91c86f3f08a72cb4d3f67f1208897";
const TURBO_STETH = "0xfd6db5011b171b05e1ea3b92f9eacaeeb055e971";
const TURBO_SOMM = "0x5195222f69c5821f8095ec565e71e18ab6a2298f";
const TURBO_EETH = "0x9a7b4980C6F0FCaa50CD5f288Ad7038f434c692e";
const TURBO_STETH_STETH_DEPOSIT = "0xc7372Ab5dd315606dB799246E8aA112405abAeFf";
const MORPHO_MAXIMIZER = "0xcf4b531b4cde95bd35d71926e09b2b54c564f5b6";
const TURBO_DIVETH = "0x6c1edce139291Af5b84fB1e496c9747F83E876c9";
const TURBO_ETHX = "0x19B8D8FC682fC56FbB42653F68c7d48Dd3fe597E";
const TURBO_EETH_V2 = "0xdAdC82e26b3739750E036dFd9dEfd3eD459b877A";
const TURBO_RSETH = "0x1dffb366b5c5A37A12af2C127F31e8e0ED86BDbe";
const TURBO_EZETH = "0x27500De405a3212D57177A789E30bb88b0AdbeC5";

const cellarsV2p5 = [
  { id: TURBO_SWETH, startBlock: 17910374 },
  { id: TURBO_GHO, startBlock: 18118614 },
  { id: ETH_GROWTH, startBlock: 18144591 },
  { id: TURBO_STETH, startBlock: 18330620 },
  { id: TURBO_SOMM, startBlock: 18516369 },
  { id: TURBO_EETH, startBlock: 18622910 },
  { id: TURBO_STETH_STETH_DEPOSIT, startBlock: 18717675 },
  { id: MORPHO_MAXIMIZER, startBlock: 19103256 },
  { id: TURBO_DIVETH, startBlock: 19117472 },
  { id: TURBO_ETHX, startBlock: 19117547 },
  { id: TURBO_EETH_V2, startBlock: 19163705 },
  { id: TURBO_RSETH, startBlock: 19338456 },
  { id: TURBO_EZETH, startBlock: 19260727 },
];

// v2.5 Cellars on Arbitrum
const REAL_YIELD_ETH_ARB = "0xC47bB288178Ea40bF520a91826a3DEE9e0DbFA4C";
const REAL_YIELD_USD_ARB = "0x392B1E6905bb8449d26af701Cdea6Ff47bF6e5A8";

const arbitrumCellarsV2p5 = [
  { id: REAL_YIELD_ETH_ARB, startBlock: 178830458 },
  { id: REAL_YIELD_USD_ARB, startBlock: 178141655 }];

  // v2.5 Cellars on Optimism
  const REAL_YIELD_ETH_OPT = "0xC47bB288178Ea40bF520a91826a3DEE9e0DbFA4C";

  const optimismCellarsV2p5 = [
    { id: REAL_YIELD_ETH_OPT, startBlock: 
      116609168 }];


module.exports = {
  cellarsV0815,
  cellarsV0816,
  cellarsV2,
  cellarsV2p5,
  arbitrumCellarsV2p5,
  optimismCellarsV2p5,
};


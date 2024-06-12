const ADDRESSES = require("../helper/coreAssets.json");

const aptFarmAddress = "0x57FF9d1a7cf23fD1A9fd9DC07823F950a22a718C";
const autoPoolABI =
  "function previewAmounts(uint256 shares) external view returns (uint256 amountX, uint256 amountY)";
const aptFarmABI =
  "function userInfo(uint256 pid, address user) external view returns (uint256 amount, uint256 rewardDebt, uint256 unpaidRewards)";

const addresses = {
  struct: {
    gmx: {
      yieldSource: "0x6aE12b0adF9716181c07D19dfe76442AB1b3817b",
      factory: "0x46f8765781ac36e5e8f9937658fa311af9d735d7",
    },
    tjap: {
      yieldSourceAvaxUsdc: "0xdf9d9Bca881484574e719bd9d016B9AFD41a7e33",
      yieldSourceAvaxBtcb: "0x736A826cF94dA966EE8ea924c5F0D079Bb25691d",
      yieldSourceAvaxWeth: "0x3BAf708e49669d54753366Bec0e77f112CF76662",
      yieldSourceEurcUsdc: "0xB35C3e0A1B889f6eC4e8e2bFFC8fE792FCF85884",
      yieldSourceSavaxAvax: "0x8696F212D12FdFbfFD40209Fd926c3E45e62DA28",
      yieldSourceWbtcBtcb: "0x63CC3EC54342acF18064772Dc2b267eCB83D64Ec",
      factory: "0x269B0AA870f1257DE00fA7E786Fd07d46cE8d26b",
    },
  },
  token: {
    gmx: {
      fsGlp: "0x9e295b5b976a184b14ad8cd72413ad846c299660",
    },
    tjap: {
      avaxUsdcAutovault: "0x32833a12ed3Fd5120429FB01564c98ce3C60FC1d",
      avaxBtcbAutovault: "0x1C739A43606794849750C50bC7C43FBbDAcdf801",
      avaxWetheAutovault: "0x6178dE6E552055862CF5c56310763EeC0145688d",
      eurcUsdcAutovault: "0x052AF5B8aC73082D8c4C8202bB21F4531A51DC73",
      savaxAvaxAutovault: "0xF812a978A08F370b9AB358a620377c0A261AA403",
      wbtcBtcbAutovault: "0x856ea7383dE9C799cb07079Fb416Fc97Ca248300",
    },
  },
};

const autopoolsMetaData = {
  [addresses.token.tjap.avaxUsdcAutovault]: {
    farmId: 0,
    yieldSource: addresses.struct.tjap.yieldSourceAvaxUsdc,
    tokenX: ADDRESSES.avax.WAVAX,
    tokenY: ADDRESSES.avax.USDC,
  },
  [addresses.token.tjap.avaxBtcbAutovault]: {
    farmId: 1,
    yieldSource: addresses.struct.tjap.yieldSourceAvaxBtcb,
    tokenX: ADDRESSES.avax.BTC_b,
    tokenY: ADDRESSES.avax.WAVAX,
  },
  [addresses.token.tjap.avaxWetheAutovault]: {
    farmId: 2,
    yieldSource: addresses.struct.tjap.yieldSourceAvaxWeth,
    tokenX: ADDRESSES.avax.WETH_e,
    tokenY: ADDRESSES.avax.WAVAX,
  },
  [addresses.token.tjap.eurcUsdcAutovault]: {
    farmId: 3,
    yieldSource: addresses.struct.tjap.yieldSourceEurcUsdc,
    tokenX: ADDRESSES.avax.EURC,
    tokenY: ADDRESSES.avax.USDC,
  },
  [addresses.token.tjap.savaxAvaxAutovault]: {
    farmId: 4,
    yieldSource: addresses.struct.tjap.yieldSourceSavaxAvax,
    tokenX: ADDRESSES.avax.SAVAX,
    tokenY: ADDRESSES.avax.WAVAX,
  },
  [addresses.token.tjap.wbtcBtcbAutovault]: {
    farmId: 5,
    yieldSource: addresses.struct.tjap.yieldSourceWbtcBtcb,
    tokenX: ADDRESSES.avax.WBTC_e,
    tokenY: ADDRESSES.avax.BTC_b,
  },
};

const aptFarmUserInfoCalls = Object.values(autopoolsMetaData).map(
  (value) => {
    return {
      target: aptFarmAddress,
      params: [value.farmId, value.yieldSource],
      abi: aptFarmABI,
    };
  }
);

module.exports = {
  autoPoolABI,
  autopoolsMetaData,
  addresses,
  aptFarmUserInfoCalls,
  aptFarmAddress,
  aptFarmABI,
};

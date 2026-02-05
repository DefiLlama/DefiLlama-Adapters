const ADDRESSES = require("../helper/coreAssets.json");
const { nullAddress, treasuryExports } = require("../helper/treasury");

const venusTreasury = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const XVS = "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63";
const venusBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";

module.exports = treasuryExports({
  bsc: {
    tokens: [
      nullAddress,
      ADDRESSES.bsc.USDT, //bsc-usdc
      ADDRESSES.bsc.USDC, //usdc
      ADDRESSES.bsc.BTCB, //BTCB
      ADDRESSES.bsc.DAI, //DAI
      ADDRESSES.bsc.BETH, //BETH
      ADDRESSES.bsc.WBNB,
      venusBTC,
      ADDRESSES.bsc.ETH, //eth
      "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8", // venusUSDC
      "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8", // venusETH
      "0xfD5840Cd36d94D7229439859C0112a4185BC0255", // venusUSDT
      "0xB248a295732e0225acd3337607cc01068e3b9c10", // venusXRP
      "0x95c78222B3D6e262426483D42CfA53685A67Ab9D", // venusBUSD
      "0xA07c5b74C9B40447a954e1466938b865b6BBea36", // venusBNB
      "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", //cake
      "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11", //thena
      "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94", //ltc
      "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E", //floki
      "0x20eE7B720f4E4c4FFcB00C4065cdae55271aECCa", //nft
      "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1", //uni
      "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A", //sxp
      "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402", //dot
      "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE", //xrp
      "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47", //ada
      "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", //link
      "0xbA2aE424d960c26247Dd6c32edC70B295c744C43", //doge
      ADDRESSES.bsc.TUSD, //tusd
      "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153", //fil
      "0xCC42724C6683B7E57334c4E856f4c9965ED682bD", //matic
      ADDRESSES.bsc.BUSD, //busd
      "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827", //ankrbnb
      "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3", //trx
      "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B", //btt
      "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf", //bch
      "0xd17479997F34dd9156Deef8F95A52D81D265be9c", //usdd
      "0x302cD8973bE5CA2334B4ff7e7b01BA41455559b3", //ethw
      "0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275", //bnbx
      "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1", //bsw
      "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16", //stkbnb
      "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99", //win
      "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5", //lisusd
      "0x12BB890508c125661E03b09EC06E404bc9289040", //raca
      "0x4B0F1812e5Df2A09796481Ff14017e6005508003", //twt
      "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F", //alpaca
      "0x12f31B73D812C6Bb0d735a218c086d44D5fe5f89", //ageur
    ],
    owners: [venusTreasury],
    ownTokens: [XVS, VAI],
  },
  era: {
    tokens: [
      ADDRESSES.era.WBTC, 
      ADDRESSES.era.ZK, 
      ADDRESSES.era.USDC, 
      ADDRESSES.era.WETH  
    ],
    owners: ['0xB2e9174e23382f7744CebF7e0Be54cA001D95599']
  }
});

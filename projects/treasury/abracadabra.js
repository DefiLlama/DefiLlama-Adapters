const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const mainnetTeamTokens = "0x5A7C5505f3CFB9a0D9A8493EC41bf27EE48c406D";
const mainnetTreasury = "0xdf2c270f610dc35d8ffda5b453e74db5471e126b";
const arbitrumTreasury = "0xA71A021EF66B03E45E0d85590432DFCfa1b7174C";
const SPELL = "0x090185f2135308BaD17527004364eBcC2D37e5F6";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      SPELL,
      ADDRESSES.ethereum.USDT, // USDT
      "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3", // MIM
      ADDRESSES.ethereum.USDC, // USDC
      ADDRESSES.ethereum.DAI, // DAI
      ADDRESSES.ethereum.CRV, // CRV
      ADDRESSES.ethereum.WETH, // wETH
      "0x4d224452801aced8b2f0aebe155379bb5d594381", // APE
      // Yearn vaults
      "0x27B5739e22ad9033bcBf192059122d163b60349D", // st-yCRV
      "0xdCD90C7f6324cfa40d7169ef80b12031770B4325", // yvCurve-stETH
      "0xa258C4606Ca8206D8aA700cE2143D7db854D168c", // yvWETH
      "0xdA816459F1AB5631232FE5e97a05BBBb94970c95", // yvDAI
      "0x3B27F92C0e212C671EA351827EDF93DB27cc0c65", // yvUSDT
      "0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE", // yvUSDC
      "0x27b7b1ad7288079A66d12350c828D3C00A6F07d7", // yvCurve-IronBank
      "0x1635b506a88fBF428465Ad65d00e8d6B6E5846C3", // yvCurve-CVXETH
      // Stargate pools
      "0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56", // S*USDC
      "0x38EA452219524Bb87e18dE1C24D3bB59510BD783", // S*USDT
      // Magic autocompounders
      "0xf35b31B941D94B249EaDED041DB1b05b7097fEb6", // magicAPE
    ],
    owners: [mainnetTeamTokens, mainnetTreasury],
    ownTokens: [SPELL],
  },
  arbitrum: {
    tokens: [
      nullAddress,
      "0x912CE59144191C1204E64559FE8253a0e49E6548", // ARB
      ADDRESSES.arbitrum.MIM, // MIM
      ADDRESSES.arbitrum.USDC, // USDC
      ADDRESSES.arbitrum.USDT, // USDT
      // Magic autocompounders
      "0x85667409a723684fe1e57dd1abde8d88c2f54214", // magicGLP
    ],
    owners: [arbitrumTreasury],
    ownTokens: [],
  },
});

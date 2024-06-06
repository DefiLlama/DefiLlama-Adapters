const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const { mergeExports } = require('../helper/utils');
const { unwrap4626Tokens, unwrapMakerPositions, unwrapConvexRewardPools, } = require('../helper/unwrapLPs')

const treasury = "0x4971DD016127F390a3EF6b956Ff944d0E2e1e462";
const treasury1 = "0x0DA0C3e52C977Ed3cBc641fF02DD271c3ED55aFe";
const treasury2 = "0x849D52316331967b6fF1198e5E32A0eB168D039d";
const treasury3 = "0xBc79855178842FDBA0c353494895DEEf509E26bB";
const GNO = ADDRESSES.ethereum.GNO;

const treasurygnosis = "0x458cd345b4c05e8df39d0a07220feb4ec19f5e6f"
const gnognosis = ADDRESSES.xdai.GNO

async function tvl(api) {
  const treasury = '0x849d52316331967b6ff1198e5e32a0eb168d039d'
  await addAuraTvl()
  await unwrapMakerPositions({ api, owner: treasury, blacklistedTokens: [ADDRESSES.ethereum.GNO]})  
  await unwrapConvexRewardPools({ api, tokensAndOwners: ['0x0A760466E1B4621579a82a39CB56Dda2F4E70f03', '0xf34DFF761145FF0B05e917811d488B441F33a968',].map(i => [i, treasury])})

  return api.getBalances()

  async function addAuraTvl() {
    const auraDepositVaults = [
      '0x712cc5bed99aa06fc4d5fb50aea3750fa5161d0f',
      '0x5209db28b3cf22a944401c83370af7a703fffb08',
      '0xd3780729035c5b302f76ced0e7f74cf0fb7c739a',
      '0xacada51c320947e7ed1a0d0f6b939b0ff465e4c2',
      '0x001b78cec62dcfdc660e06a91eb1bc966541d758',
      '0xe4683fe8f53da14ca5dac4251eadfb3aa614d528',
      '0x6256518ae9a97c408a03aaf1a244989ce6b937f6',
      '0x228054e9c056f024fc724f515a2a8764ae175ed6',
    ]
    return unwrap4626Tokens({ api, tokensAndOwners: auraDepositVaults.map(i => [i, treasury])})
  }
}

async function ownTokens(api) {
  return unwrapMakerPositions({ api, owner: '0x849d52316331967b6ff1198e5e32a0eb168d039d', skipDebt: true, whitelistedTokens: [ADDRESSES.ethereum.GNO]})  
}

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.DAI,//DAI
      '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',//cDAI
      '0x39AA39c021dfbaE8faC545936693aC917d5E7563',//cUSDC
      '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',//GRT
      ADDRESSES.ethereum.CRV,
      '0xba100000625a3754423978a60c9317c58a424e3D',//BAL
      ADDRESSES.ethereum.CVX,
      '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',//COW
      ADDRESSES.ethereum.STETH,
      '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',//ankETH
      '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',//ENS
      '0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d',//PNK
      ADDRESSES.ethereum.WSTETH,
      '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF',//AURA
      '0x543Ff227F64Aa17eA132Bf9886cAb5DB55DCAddf',//GEN
      '0x255Aa6DF07540Cb5d3d297f0D0D4D84cb52bc8e6',//RDN
      '0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb',//INST
      '0x6243d8CEA23066d098a15582d81a598b4e8391F4',//FLX
      ADDRESSES.ethereum.LIDO,
      '0x1982b2F5814301d4e9a8b0201555376e62F82428',
      "0xd33526068d116ce69f19a9ee46f0bd304f21a51f",
      "0x543ff227f64aa17ea132bf9886cab5db55dcaddf",
      "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f",
      "0x31c8eacbffdd875c74b94b077895bd78cf1e64a3",
      "0x48c3399719b582dd63eb5aadf12a40b4c3f52fa2",
      "0x20bc832ca081b91433ff6c17f85701b6e92486c5",
      "0x616e8BfA43F920657B3497DBf40D6b1A02D4608d",
      "0x9c39809dec7f95f5e0713634a4d0701329b3b4d2", // debt variableDebtWBTC
      "0xa13a9247ea42d743238089903570127dda72fe44",
    ],
    owners: [treasury, treasury1, treasury2, treasury3,],
    ownTokens: [GNO],
    resolveUniV3: true,
  },
  xdai: {
    tokens: [
      nullAddress,
      ADDRESSES.xdai.WETH, //eth
      "0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6", //wstETH 
      "0xEb30C85CC528537f5350CF5684Ce6a4538e13394",
      "0xd4e420bBf00b0F409188b338c5D87Df761d6C894",
      "0xBdF4488Dcf7165788D438b62B4C8A333879B7078",
      "0x44932e3b1E662AdDE2F7bac6D5081C5adab908c6",
      "0x291B5957c9CBe9Ca6f0b98281594b4eB495F4ec1",
      "0x3a97704a1b25F08aa230ae53B352e2e72ef52843",
      ADDRESSES.xdai.WBTC,
      "0xA26783eAd6C1f4744685c14079950622674ae8A8",
      "0xa99FD9950B5D5dCeEaf4939E221dcA8cA9B938aB",
      "0x21d4c792Ea7E38e0D0819c2011A2b1Cb7252Bd99",
      "0x5519E2d8A0af0944EA639C6DBAD69A174DE3ECF8",
      "0x4b1E2c2762667331Bc91648052F646d1b0d35984",
      "0x388Cae2f7d3704C937313d990298Ba67D70a3709",
      "0x1509706a6c66CA549ff0cB464de88231DDBe213B",
      "0x712b3d230F3C1c19db860d80619288b1F0BDd0Bd",
      "0x7eF541E2a22058048904fE5744f9c7E4C57AF717",
    ],
    owners: [treasurygnosis],
    ownTokens: [gnognosis],
    resolveUniV2: true,
  },
})

module.exports = mergeExports([module.exports, {
  ethereum: { tvl, ownTokens }
}])

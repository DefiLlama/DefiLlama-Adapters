const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking, } = require("../helper/staking");
const { sumUnknownTokens } = require('../helper/unknownTokens');

const chain = "arbitrum";

const plutusToken = "0x51318B7D00db7ACc4026C88c3952B66278B6A67F";
const DPX = '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55'
const plsDpx = "0xF236ea74B515eF96a9898F5a4ed4Aa591f253Ce1";
const plsDpxFarmV1 = "0x20DF4953BA19c74B2A46B6873803F28Bf640c1B5";
const plsDpxFarm = "0x75c143460F6E3e22F439dFf947E25C9CcB72d2e8";
const plsJones = "0xe7f6C3c1F0018E4C08aCC52965e5cbfF99e34A44";
const plsJonesFarm = "0x23B87748b615096d1A0F48870daee203A720723D";
const plsSpa = "0x0D111e482146fE9aC9cA3A65D92E65610BBC1Ba6";
const plsSpaFarm = "0x73e7c78E8a85C074733920f185d1c78163b555C8";
const plvGlpToken = ADDRESSES.arbitrum.plvGLP;
const plgGlpPlutusChef = "0x4E5Cf54FdE5E1237e80E87fcbA555d829e1307CE";

const dpxPlsDpxMasterChef = "0xA61f0d1d831BA4Be2ae253c13ff906d9463299c2";
const dpxPlsDpxLp = "0x16e818e279d7a12ff897e257b397172dcaab323b";

const plsEthMasterChef = "0x5593473e318F0314Eb2518239c474e183c4cBED5";
const plsEthLp = "0x6CC0D643C7b8709F468f58F363d73Af6e4971515";

const lps = [
  '0x16e818e279d7a12ff897e257b397172dcaab323b', // DPX-plsDPX-LP
  '0x69fdf3b2e3784a315e2885a19d3565c4398d49a5', // plxJONES JONES-WETH SLP
]
const coreAssets = [
  DPX,
  '0xe8EE01aE5959D3231506FcDeF2d5F3E85987a39c', // JONES-WETH SLP
]
const plutusStakingContracts = [
  "0x27Aaa9D562237BF8E024F9b21DE177e20ae50c05",
  "0xE59DADf5F7a9decB8337402Ccdf06abE5c0B2B3E",
  "0xBEB981021ed9c85AA51d96C0c2edA10ee4404A2e",
];

async function tvl(ts, _block, {[chain]: block}) {
  const balances = {}
  const { output: glpBal } = await sdk.api.erc20.balanceOf({ target: plvGlpToken, owner: plgGlpPlutusChef, chain, block, })
  sdk.util.sumSingleBalance(balances, 'arbitrum:0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258', glpBal)  // sum as GLP
  
  const { output: plvGlpSupply } = await sdk.api.erc20.totalSupply({target: plvGlpToken, chain, block});

  sdk.util.sumSingleBalance(balances, 'arbitrum:0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258', plvGlpSupply)  // sum as GLP as well

  
  const tokensAndOwners = [
     [plsDpx, plsDpxFarmV1],
     [plsDpx, plsDpxFarm],
     [plsJones, plsJonesFarm],
     [plsSpa, plsSpaFarm],
  ]
  return sumUnknownTokens({
    balances, tokensAndOwners, lps, coreAssets, chain, block,
  })
}

module.exports = {
  misrepresentedTokens: true,
  [chain]: {
    tvl,
    pool2: staking([dpxPlsDpxMasterChef, plsEthMasterChef], [dpxPlsDpxLp, plsEthLp], chain),
    staking: staking(plutusStakingContracts, plutusToken, chain),
  },
};

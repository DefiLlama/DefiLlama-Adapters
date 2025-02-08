const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking, } = require("../helper/staking");
const { sumUnknownTokens } = require('../helper/unknownTokens');

const { uniV3Export } = require("../helper/uniswapV3");

const chain = "arbitrum";

const plutusToken = "0x51318B7D00db7ACc4026C88c3952B66278B6A67F";

const SYK = "0xacc51ffdef63fb0c014c882267c3a17261a5ed50";
const plsSYK = "0x68d6d2545f14751baf36c417c2cc7cdf8da8a15b";
const plsSYKFarm = "0xCE8A501710ff0717601AD43B51f4b7CF832beff4";
const SPA = '0x5575552988a3a80504bbaeb1311674fcfd40ad4b'
const plsSpa = "0x0D111e482146fE9aC9cA3A65D92E65610BBC1Ba6";
const plsSpaFarm = "0x73e7c78E8a85C074733920f185d1c78163b555C8";
const GRAIL = "0x3d9907f9a368ad0a51be60f7da3b97cf940982d8"
const plsGrail = "0x9e6B748d25Ed2600Aa0ce7Cbb42267adCF21Fd9B";
const plsGrailFarm = "0x62c10f8f003093C942a9AB8B3E0F94BA612CC982";
const plsRdntv2 = "0x6dbf2155b0636cb3fd5359fccefb8a2c02b6cb51";
const plsRdntv2Burn= "0x6dbF2155B0636cb3fD5359FCcEFB8a2c02B6cb51"
const ARB = "0x912ce59144191c1204e64559fe8253a0e49e6548";
const dLP = "0x32df62dc3aed2cd6224193052ce665dc18165841";
const JonesLP = '0xe8EE01aE5959D3231506FcDeF2d5F3E85987a39c'
const plvGlpToken = ADDRESSES.arbitrum.plvGLP;
const plgGlpPlutusChef = "0x4E5Cf54FdE5E1237e80E87fcbA555d829e1307CE";

// DEPRECATED; will track to maintain history
const plsJones = "0xe7f6C3c1F0018E4C08aCC52965e5cbfF99e34A44";
const plsJonesFarm = "0x23B87748b615096d1A0F48870daee203A720723D";
const plsDpxFarmV1 = "0x20DF4953BA19c74B2A46B6873803F28Bf640c1B5";
const plsDpxFarm = "0x75c143460F6E3e22F439dFf947E25C9CcB72d2e8";
const plsRdnt = "0x1605bbDAB3b38d10fA23A7Ed0d0e8F4FEa5bFF59";
const plsRdntFarm = "0xaE3f67589Acb90bd2cbccD8285b37fe4F8F29042"
const plsArb = "0x7a5D193fE4ED9098F7EAdC99797087C96b002907"
const plsARbFarm = "0xCfc273D86333bF453b847d4D8cb7958307D85196"
const DPX = '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55'
const plsDpx = "0xF236ea74B515eF96a9898F5a4ed4Aa591f253Ce1";
const dpxPlsDpxMasterChef = "0xA61f0d1d831BA4Be2ae253c13ff906d9463299c2";
const dpxPlsDpxLp = "0x16e818e279d7a12ff897e257b397172dcaab323b";

const plsEthMasterChef = "0x5593473e318F0314Eb2518239c474e183c4cBED5";
const plsEthLp = "0x6CC0D643C7b8709F468f58F363d73Af6e4971515";

const lps = [
  '0x16e818e279d7a12ff897e257b397172dcaab323b', // DPX-plsDPX-LP
  '0x69fdf3b2e3784a315e2885a19d3565c4398d49a5', // plsJONES JONES-WETH SLP
  '0x617462e8cc146cb5d8dfd070dd23c337c81798bc', // plsSPA-SPA LP
  '0xdaccf9aa59ad3c9a02b69639fe8a1e3c6493d39e', // plsSYK-SYK LP
  '0xc0Ad0bDe7DE13B3B9Ca5eacb156D30c354c591EA', // plsGrail-GRAIL LP
  '0x47a52b2bee1a0cc9a34bb9ee34c357c054112c3e', // plsARB-ARB LP
]

const coreAssets = [
  DPX,
  JonesLP,
  dLP,
  SPA,
  SYK,
  GRAIL,
  ARB,
]
const plutusStakingContracts = [
  "0x27Aaa9D562237BF8E024F9b21DE177e20ae50c05",
  "0xE59DADf5F7a9decB8337402Ccdf06abE5c0B2B3E",
  "0xBEB981021ed9c85AA51d96C0c2edA10ee4404A2e",
  "0xE9645988a5E6D5EfCc939bed1F3040Dba94C6CbB"
];

module.exports = uniV3Export({
  plutus: {
    factory: "0x1a3c9B1d2F0529D97f2afC5136Cc23e58f1FD35B",
    fromBlock: 102286676,
    isAlgebra: true,
  },
});

async function tvl(ts, _block, {[chain]: block}) {
  const balances = {}
  
  try {
    // Calculate GLP value
    try {
      const { output: glpBal } = await sdk.api.erc20.balanceOf({ 
        target: plvGlpToken, 
        owner: plgGlpPlutusChef, 
        chain, 
        block, 
      })
      sdk.util.sumSingleBalance(balances, 'arbitrum:0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258', glpBal)
    } catch (e) {
      console.log(`Error getting GLP balance: ${e.message}`)
    }

    try {
      // calculate syk TVL
      const { output: plsSykSupply } = await sdk.api.erc20.totalSupply({
        target: plsSYK,
        chain,
        block
      });
      sdk.util.sumSingleBalance(balances, `arbitrum:${SYK}`, plsSykSupply)
    } catch (e) {
      console.log(`Error getting plsSyk total supply: ${e.message}`)
    }

    // calcluate plsRdntv2 TVL
    try {
      const { output: plsRdntv2Supply } = await sdk.api.erc20.totalSupply({
        target: plsRdntv2,
        chain,
        block
      });
      
      // Get rate from plsRdntv2Burn contract
      const { output: ratio } = await sdk.api.abi.call({
        target: plsRdntv2Burn,
        abi: {
          "inputs": [],
          "name": "getRate",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        chain,
        block
      });

      // Calculate DLP supply (convert ratio to decimal if needed)
      const dlpSupply = (ratio * plsRdntv2Supply) / 1e18  // Adjust decimals as needed
      
      sdk.util.sumSingleBalance(balances, `arbitrum:${dLP}`, dlpSupply)
    } catch (e) {
      console.log(`Error getting plsRdntv2 calculation: ${e.message}`)
    }

    // calculate SPA TVL (assumes 1:1 SPA locked to outstand plsSpa supply)
    try {
      const { output: plsSpaSupply } = await sdk.api.erc20.totalSupply({
        target: plsSpa,
        chain,
        block
      });
      sdk.util.sumSingleBalance(balances, `arbitrum:${SPA}`, plsSpaSupply)
    } catch (e) {
      console.log(`Error getting plsSpa total supply: ${e.message}`)
    }

    //calculate GRAIL TVL
    try {
      const { output: plsGrailSupply } = await sdk.api.erc20.totalSupply({
        target: plsGrail,
        chain,
        block
      });
      sdk.util.sumSingleBalance(balances, `arbitrum:${GRAIL}`, plsGrailSupply)
    } catch (e) {
      console.log(`Error getting plsGrail total supply: ${e.message}`)
    }

    //calculate ARB TVL
    try {
      const { output: plsArbSupply } = await sdk.api.erc20.totalSupply({
        target: plsArb,
        chain,
        block
      });
      sdk.util.sumSingleBalance(balances, `arbitrum:${ARB}`, plsArbSupply)
    } catch (e) {
      console.log(`Error getting plsArb total supply: ${e.message}`)
    }

  } catch (e) {
    console.log(`Error in TVL calculation: ${e.message}`)
  }

  return balances
}

async function stakingPlsTvl(api) {
  const tokensAndOwners = [
     [plsDpx, plsDpxFarmV1],
     [plsDpx, plsDpxFarm],
     [plsSYK, plsSYKFarm],
     [plsJones, plsJonesFarm],
     [plsSpa, plsSpaFarm],
     [plsRdnt, plsRdntFarm],
     [plsArb, plsARbFarm],
     [plsGrail, plsGrailFarm],
  ]

  // Get raw balances
  const bals = await api.multiCall({  
    abi: 'erc20:balanceOf',
    calls: tokensAndOwners.map(([token, owner]) => ({
      target: token,
      params: owner
    }))
  })

  // Add raw balances and log them
  tokensAndOwners.forEach(([token], i) => {
    if (bals[i]) {
      console.log(`Adding balance for ${token}: ${bals[i]}`)
      api.add(token, bals[i])
    }
  })

  // // Add plvGLP balance
  // try {
  //   const { output: plvGlpSupply } = await sdk.api.erc20.totalSupply({
  //     target: plvGlpToken, 
  //     chain: api.chain, 
  //     block: api.block
  //   });
  //   api.add('arbitrum:0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258', plvGlpSupply)
  // } catch (e) {
  //   console.log(`Error getting plvGLP total supply: ${e.message}`)
  // }

  return sumUnknownTokens({
    api,
    lps,
    coreAssets,
    resolveLP: true,
    log_coreAssetPrices: true,
    debug: true,
  })
}

const stakingPls = () => async (timestamp, _block, chainBlocks) => {
  console.log('\nCalling stakingPls with:', { timestamp, chain, block: chainBlocks[chain] })
  const result = await stakingPlsTvl(new sdk.ChainApi({ chain, block: chainBlocks[chain], timestamp }))
  console.log('\nstakingPls returning:', result)
  return result
}

module.exports = {
  misrepresentedTokens: true,
  [chain]: {
    tvl,
    staking: sdk.util.sumChainTvls([
      staking(plutusStakingContracts, plutusToken, chain),
      staking(plgGlpPlutusChef, plvGlpToken, chain),
      stakingPls()
    ]),
  },
};

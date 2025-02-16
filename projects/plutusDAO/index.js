const sdk = require("@defillama/sdk");
const { staking, } = require("../helper/staking");
const { sumERC4626Vaults, } = require("../helper/erc4626");
const axios = require('axios');
const { sumTokens2 } = require("../helper/unwrapLPs");

const chain = "arbitrum";

const plutusToken = "0x51318B7D00db7ACc4026C88c3952B66278B6A67F";

const SYK = "0xacc51ffdef63fb0c014c882267c3a17261a5ed50";
const plsSYK = "0x68d6d2545f14751baf36c417c2cc7cdf8da8a15b";
const SPA = '0x5575552988a3a80504bbaeb1311674fcfd40ad4b'
const plsSpa = "0x0D111e482146fE9aC9cA3A65D92E65610BBC1Ba6";
const GRAIL = "0x3d9907f9a368ad0a51be60f7da3b97cf940982d8"
const plsGrail = "0x9e6B748d25Ed2600Aa0ce7Cbb42267adCF21Fd9B";
const plsRdntv2 = "0x6dbf2155b0636cb3fd5359fccefb8a2c02b6cb51";
const plsRdntv2Burn = "0x6dbF2155B0636cb3fD5359FCcEFB8a2c02B6cb51"
const dLP = "0x32df62dc3aed2cd6224193052ce665dc18165841";
const plvGlpToken = '';
const plvGlpPlutusChef = "0x4E5Cf54FdE5E1237e80E87fcbA555d829e1307CE";

// DEPRECATED; will track to maintain history
const plsJones = "0xe7f6C3c1F0018E4C08aCC52965e5cbfF99e34A44";
const JonesLP = '0xe8EE01aE5959D3231506FcDeF2d5F3E85987a39c'
const plsArb = "0x7a5D193fE4ED9098F7EAdC99797087C96b002907"
const ARB = "0x912ce59144191c1204e64559fe8253a0e49e6548";
const DPX = '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55'

const plutusStakingContracts = [
  "0x27Aaa9D562237BF8E024F9b21DE177e20ae50c05",
  "0xE59DADf5F7a9decB8337402Ccdf06abE5c0B2B3E",
  "0xBEB981021ed9c85AA51d96C0c2edA10ee4404A2e",
  "0xE9645988a5E6D5EfCc939bed1F3040Dba94C6CbB"
];

async function tvl(api) {
  const tokensAndOwners = [
    ['0x1aDDD80E6039594eE970E5872D247bf0414C8903', '0xbec7635c7A475CbE081698ea110eF411e40f8dd9', ], // fsGLP
    ['0x460c2c075340EbC19Cf4af68E5d83C194E7D21D0', '0xC12a53AbC62Cd380BC952dEcEe825Fd4869a3bff', ], // plsJones
    ['0x912CE59144191C1204E64559FE8253a0e49E6548', '0x8163A7425c0a5988edf60e98DE186c931e2ce4C7', ], // ARB
  ]
  await sumTokens2({ api, tokensAndOwners, resolveLP: true,  })
  const plsSupply = await api.call({  abi: 'erc20:totalSupply', target: plsGrail, permitFailure: true, })
  if (plsSupply) {
    const grailBal = await api.call({  abi: 'function  usersAllocation(address) view returns (uint256)', target: '0x5422AA06a38fd9875fc2501380b40659fEebD3bB', params: '0x6ceD01518Efd0487EEbeBdD0D33a093adc8e39Ae'})
    api.add(GRAIL, grailBal)
  }

  const plsTokens = [plsSpa, plsSYK]
  const uTokens = [SPA, SYK]

  const tokenSupplies = await api.multiCall({  abi: 'erc20:totalSupply', calls: plsTokens, permitFailure: true, })

  tokenSupplies.forEach((supply, idx) => {
    if (supply) api.add(uTokens[idx], supply)
  })

  return;

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
          "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
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
}

module.exports = {
  arbitrum: {
    tvl,
    staking: staking(plutusStakingContracts, plutusToken, chain),
  },
};

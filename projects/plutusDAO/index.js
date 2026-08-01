const ADDRESSES = require('../helper/coreAssets.json')
const { staking, } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");

const plutusToken = "0x51318B7D00db7ACc4026C88c3952B66278B6A67F";

const SYK = "0xacc51ffdef63fb0c014c882267c3a17261a5ed50";
const plsSYK = "0x68d6d2545f14751baf36c417c2cc7cdf8da8a15b";
const DPX = '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55'
const plsDPX = '0xF236ea74B515eF96a9898F5a4ed4Aa591f253Ce1'
const SPA = '0x5575552988a3a80504bbaeb1311674fcfd40ad4b'
const plsSpa = "0x0D111e482146fE9aC9cA3A65D92E65610BBC1Ba6";
const GRAIL = "0x3d9907f9a368ad0a51be60f7da3b97cf940982d8"
const plsGrail = "0x9e6B748d25Ed2600Aa0ce7Cbb42267adCF21Fd9B";
const plsRdntv2 = "0x6dbf2155b0636cb3fd5359fccefb8a2c02b6cb51";

const plutusStakingContracts = [
  "0x27Aaa9D562237BF8E024F9b21DE177e20ae50c05",
  "0xE59DADf5F7a9decB8337402Ccdf06abE5c0B2B3E",
  "0xBEB981021ed9c85AA51d96C0c2edA10ee4404A2e",
  "0xE9645988a5E6D5EfCc939bed1F3040Dba94C6CbB"
];

async function tvl(api) {
  const plsGrailSupply = await api.call({ abi: 'erc20:totalSupply', target: plsGrail, permitFailure: true, })
  if (plsGrailSupply) {
    const grailBal = await api.call({ abi: 'function  usersAllocation(address) view returns (uint256)', target: '0x5422AA06a38fd9875fc2501380b40659fEebD3bB', params: '0x6ceD01518Efd0487EEbeBdD0D33a093adc8e39Ae' })
    api.add(GRAIL, grailBal)
  }

  const plsTokens = [plsSpa, plsSYK, plsDPX]
  const uTokens = [SPA, SYK, DPX]

  const tokenSupplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: plsTokens, permitFailure: true, })

  tokenSupplies.forEach((supply, idx) => {
    if (supply) api.add(uTokens[idx], supply)
  })


  // calcluate plsRdntv2 TVL
  const plsRNDTSupply = await api.call({ abi: 'erc20:totalSupply', target: plsRdntv2, permitFailure: true, })
  if (plsRNDTSupply) {
    const rndtWethBal = await api.call({ abi: 'function  lockedBalance(address) view returns (uint256)', target: '0x76ba3ec5f5adbf1c58c91e86502232317eea72de', params: '0x2A2CAFbB239af9159AEecC34AC25521DBd8B5197' })
    api.add('0x32dF62dc3aEd2cD6224193052Ce665DC18165841', rndtWethBal)
  }


  const tokensAndOwners = [
    [ADDRESSES.arbitrum.fsGLP, '0xbec7635c7A475CbE081698ea110eF411e40f8dd9',], // fsGLP
    ['0x460c2c075340EbC19Cf4af68E5d83C194E7D21D0', '0xC12a53AbC62Cd380BC952dEcEe825Fd4869a3bff',], // plsJones
    [ADDRESSES.arbitrum.ARB, '0x8163A7425c0a5988edf60e98DE186c931e2ce4C7',], // ARB
  ]
  await sumTokens2({ api, tokensAndOwners, resolveLP: true, })
}


module.exports = {
  arbitrum: {
    tvl,
    staking: staking(plutusStakingContracts, plutusToken),
  },
};

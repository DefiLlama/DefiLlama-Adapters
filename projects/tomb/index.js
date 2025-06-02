const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");


const tshareTokenAddress = "0x4cdf39285d7ca8eb3f090fda0c069ba5f4145b37";
const tshareRewardPoolAddress = "0xcc0a87f7e7c693042a9cc703661f5060c80acb43";
const masonryAddress = "0x8764de60236c5843d9faeb1b638fbce962773b67";
const lif3GenesisAddress = '0x072f35cfa85af2793348ccc0eaa0e16e898946a8'

const ftmLPs = [
  "0x2a651563c9d3af67ae0388a5c8f89b867038089e", // tombFtmLpAddress
  "0x4733bc45ef91cf7ccecaeedb794727075fb209f2", //tshareFtmLpAddress
];

async function pool2(api) {
  return sumTokens2({
    api, owner: tshareRewardPoolAddress, tokens: ftmLPs,
  })
}

async function staking(api) {
  const toa = [
    [tshareTokenAddress, masonryAddress, ],
  ]

  const lif3Tokens = [
    '0x4cdf39285d7ca8eb3f090fda0c069ba5f4145b37', // TSHARE
    '0x6c021ae822bea943b2e66552bde1d2696a53fbb7', // TOMB
    '0xcbe0ca46399af916784cadf5bcc3aed2052d6c45', // LSHARE
  ]

  lif3Tokens.forEach(t => toa.push([t, lif3GenesisAddress]))
  
  return sumTokens2({
    api, tokensAndOwners: toa,
  })
}

async function lif3GenesisTVL(api) {
  const tokens = [
    ADDRESSES.fantom.WFTM, // WFTM
    ADDRESSES.fantom.USDC, // USDC
    '0x321162Cd933E2Be498Cd2267a90534A804051b11', // BTC
    '0x74b23882a30290451A17c44f4F05243b6b58C76d', // ETH
    ADDRESSES.fantom.DAI, // DAI
    ADDRESSES.fantom.MIM, // MIM
    '0x8d7d3409881b51466b483b11ea1b8a03cded89ae', // BASED
    '0x49c290ff692149a4e16611c694fded42c954ab7a', // BSHARE
    '0x09e145a1d53c0045f41aeef25d8ff982ae74dd56', // Zoo
  ]
  
  return sumTokens2({
    api, tokens, owner: lif3GenesisAddress,
  })
}


module.exports = {
  methodology: "Pool2 deposits consist of TOMB/FTM and TSHARE/FTM LP tokens deposits while the staking TVL consists of the TSHARES tokens locked within the Masonry contract(0x8764de60236c5843d9faeb1b638fbce962773b67).",
  fantom: {
    tvl: lif3GenesisTVL,
    pool2,
    staking,
  },
};
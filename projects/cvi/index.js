const ADDRESSES = require('../helper/coreAssets.json')
const { staking, stakings } = require("../helper/staking");

const stakingContract = "0xDb3130952eD9b5fa7108deDAAA921ae8f59beaCb";
const GOVI = "0xeeaa40b28a2d1b0b08f6f97bb1dd4b75316c6107";

const stakingPool2Contracts = [
  "0x936Dd3112a9D39Af39aDdA798503D9E7E7975Fb7",
  "0xcF05a60bCBC9c85cb2548DAfDC444c666A8F466a",
  "0xe6e5220291CF78b6D93bd1d08D746ABbC115C64b",
];

const lpPool2Addresses = [
  "0x1EE312A6d5fe7b4B8c25f0a32fCA6391209eBEBF",
  "0x7E6782E37278994d1e99f1a5d03309B4b249d919",
  "0xA2b04F8133fC25887A436812eaE384e32A8A84F2",
];

/*** Polygon Addresses ***/
const stakingContracts_polygon = [
  "0x399b649002277d7a3502C9Af65DE71686F356f33",
  "0xD013FFC6Ed3B2c773051a3b83E763dF782D7b31f",
];

const GOVI_polygon = ADDRESSES.polygon.GOVI;

const stakingPool2Contract_polygon =
  "0x27792cDa195d07ffb36E94e253D67361661a16Dc";
const lpPool2Address_polygon = "0x1dAb41a0E410C25857F0f49B2244Cd089AB88DE6";

const platformLiquidityContracts_polygon = [
  "0x88D01eF3a4D586D5e4ce30357ec57B073D45ff9d",
  "0x3863D0C9b7552cD0d0dE99fe9f08a32fED6ab72f",
];

/*** Arbitrum Addresses ***/
const stakingContract_arbitrum = "0xDb3e7deAb380B43189A7Bc291fa2AFeAA938dCc3";
const GOVI_arbitrum = ADDRESSES.arbitrum.GOVI;

async function ethTvl(api) {
  const ethPlatforms = [
    "0x5005e8Dc0033E78AF80cfc8d10f5163f2FcF0E79",
    "0xe0437BeB5bb7Cf980e90983f6029033d710bd1da", //USDTPlatform
  ];

  const USDCPlatforms = [
    "0x2167EEFB9ECB52fB6fCf1ff8f7dAe6F0121F4fBC",//USDCPlatform
    "0x0E0DA40101D8f6eB1b1d6b0215327e8452e0Bc60",//ETHVIPlatform
  ]
  const tokens = await api.multiCall({ abi: 'address:getToken', calls: ethPlatforms })
  const owners = ethPlatforms.concat(USDCPlatforms)
  USDCPlatforms.forEach(_ => tokens.push(ADDRESSES.ethereum.USDC))
  return api.sumTokens({ tokensAndOwners2: [tokens, owners] })
}

async function polygonTvl(api) {
  const tokens = await api.multiCall({ abi: 'address:token', calls: platformLiquidityContracts_polygon })
  return api.sumTokens({ tokensAndOwners2: [tokens, platformLiquidityContracts_polygon] })
}
async function arbiTvl(api) {
  const vaults = [
    // '0xfdeb59a2b4891ea17610ee38665249acc9fcc506',
    '0xAf7a27b1291Bff85aCaf0A90078d81468A705E58',
    '0x8D1909AE8A5A03adf3a48EE5543ae4ECfF6845A6',
    // '0xe8E3057E9A43f01d4505492A394B0F51200Cdd40',
    '0xC3c2A3306d585fEfA7a0158B87DA7b375EE390Ec',
  ]
  const thetaVaults = ['0x7C0C30114746F8C6B8eeAB8fB9b97B85E98926c5', '0x0b3923C4192d644a02EFb176BfE75CE0091F5C63']
  const tokens = await api.multiCall({ abi: 'address:token', calls: vaults})
  thetaVaults.forEach(_ => tokens.push(ADDRESSES.arbitrum.USDC_CIRCLE))
  const owners = vaults.concat(thetaVaults)
  owners.push('0xfdeb59a2b4891ea17610ee38665249acc9fcc506', '0xe8E3057E9A43f01d4505492A394B0F51200Cdd40')
  tokens.push(ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.USDC_CIRCLE)
  return api.sumTokens({ tokensAndOwners2: [tokens, owners] })
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
    pool2: staking(stakingPool2Contracts, lpPool2Addresses),
    staking: staking(stakingContract, GOVI),
  },
  polygon: {
    staking: stakings(stakingContracts_polygon, GOVI_polygon, "polygon", GOVI),
    pool2: staking(stakingPool2Contract_polygon, lpPool2Address_polygon,),
    tvl: polygonTvl,
  },
  arbitrum: {
    staking: staking(stakingContract_arbitrum, GOVI_arbitrum, "arbitrum", GOVI),
    tvl: arbiTvl,
  },
  methodology:
    "Counts liquidity on the Platforms and Staking seccions through Platfrom and Staking Contracts",
}
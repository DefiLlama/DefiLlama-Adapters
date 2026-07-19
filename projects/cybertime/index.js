const abi = {
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accCTFPerShare)"
  };
const { pool2s } = require("../helper/pool2");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const pool2FarmContracts = [
  //CTFFarmV1
  "0x750c8Ee365b1EA4dAf114Bd73Aeb31fc5B742D8B",
  //CTFFarmV2
  "0x1F8f4492bd0D8004E323e0014f76c99e54D1242b",
  //CFTFarmV3 Old
  "0x08985ff15dE1ed66dDBfD08a2705A8B3612A61Fd",
  //CFTFarmV3
  "0xCE997537498793d25dAb0F289e161DB26914275A",
];

const lpPool2 = [
  //CFT-WBNB Old Cake LP
  "0x4709932b8a9a76187879856e8Fd13eadC6C68B08",
  //NFTL-WBNB Old Cake LP
  "0xab5F212D945c6109BE17A61a5598e2dD6F896Bdf",
  //NFTL-WBNB New0 Cake LP
  "0xf41395C4e748813c98E17263Ac0cCE15B54d5983",
  //CFT-WBNB New0 Cake LP
  "0x584B93f109B83D7A01DF4fF0d450915B97FAd790",
  //NFTL-WBNB New1 Cake LP
  "0x07c3e0B62A62133eaB8c5e759904350d254B9672",
  //CFT-WBNB New1 Cake LP
  "0x15CD39e9e494177f13A5Db7c36883BE1a5D95eD8",
  //CFT-WBNB V3 Ape LP
  "0x51535A61787EcbBCbAeFb2eEe0E2D4FeE2D57607",
  //CFT-WBNB V3 Old Ape LP
  "0x6f8daEC3f0764B19db745112D297bbea1E6D96e3",
];

const NFTL_V1 = "0x2f7b4c618dc8e0bba648e54cdadce3d8361f9816";
const CTF_V1 = "0x299bac24c8ad5635586fde6619eff7891a6c8969";

const NFTL_V2 = "0xE5904E9816b309d3eD4d061c922f5aa8f3B24C92";
const CTF_V2 = "0x410319197d3394652B7ddDc669E58fbe30B56090";

const CTF_V3 = "0x655A46cd88e18a338ECE048228a388c25BFdA9f3";
const CTF_V3_old = "0x398302C08EcF94AA6E55386182E50e335405a956";

const farms = [
  //NFTLFarmV1
  "0x57Bc258169b03047D7778c41014c9cF7779ACA76",
  //NFTLFarmV2
  "0x45Eec2D2f9b01D91eCC685945A904C895CAbB7a3",
  //CFTFarmV3 Old
  "0x08985ff15dE1ed66dDBfD08a2705A8B3612A61Fd",
  //CFTFarmV3
  "0xCE997537498793d25dAb0F289e161DB26914275A",
];


const bscTvl = async (api) => {
  const blacklistedTokens = [CTF_V3, CTF_V2]
  const ownerTokens = []
  for (const farm of farms) {
    const poolInfos = await api.fetchList({  lengthAbi: 'poolLength', itemAbi: abi.poolInfo, target: farm })
    ownerTokens.push([poolInfos.map(pool => pool.lpToken), farm])
  }
  return sumTokens2({ api, ownerTokens, blacklistedTokens, resolveLP: true, })
};

module.exports = {
  bsc: {
    staking: staking(farms, [NFTL_V1, CTF_V1, NFTL_V2, CTF_V2, CTF_V3,]),
    pool2: pool2s(pool2FarmContracts, lpPool2),
    tvl: bscTvl,
  },
  methodology:
    "We count liquidity on the Farms threw their Contracts",
};

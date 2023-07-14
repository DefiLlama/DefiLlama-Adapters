const token = {
  XWIN: '0xd88ca08d8eec1e9e09562213ae83a7853ebb5d28'
};

const Strategies = {
  xSCA: "0x0a652784DF3f8Abde85dAEeee77D1EA97f5c5B24",
  xDCA: "0x482ae949E4a70953fCa090717b68359b73b8602a",
  xWinBBMA: "0x5EFaaBc34a3ba66f1fD02F056AC457AeBaF57D55",
  xWinIRT: "0x5A8a66DF53DF88844c60829967b88d00eD208E08",
  xCAKE_V: "0x1d2430bBfe86432E36A7C7286E99f78546F23De9",
  xETH_V: "0x0C34Aa4e36983aB6ec11bC557A3B8cF79A7a9Ae7",
  xUSDC_V: "0xcBca44d60c5A2b3c56ACfB51aFC66Ea04b8a2742",
  xBUSD_V: "0xf4979C043df6f7d5dA929DeAB11b220A82886395",
  xBTC_V: "0x7A0dEc70473602Cd0EF3Dc3d909b6Dc3FA42116C",
  xUSDT_V: "0x8B7fcACB99124F009c8470FDa6f5fcF60277BDB2",
  xADA_V: "0x605926F795FD9B4c3A8B1A2db33cBE01c66bA83f",
  xBTC_O: "0x69764856e82180150f5366be610E40c2f812d7D6",
  xUSDT_O: "0xCEbd365e4BFd8589Fd6BDe21898DB35a8095f956",
};

const PublicVault = {
  fDEFI: "0x61d5722290F8755b2f31D260064658D6Ad837F37",
  fMIV: "0x0A0817454710102F2bcB2215D616cBe3aFf495e5",
  fxDollar: "0xFa4d4B4243dDA1F5f4d09269f61D57d02470635C",
  fBTCETH: "0x284b4aDD0C9669f635EA64418C216821c45D0B48",
  fvUSDT: "0xE949d266E8740470a15DFB1F40A795b5a2b63f02",
  fCombo: "0x4d4F948C8E9Ec3d1cE1B80d598f57F8c75c64e4a",
  fTACombo: "0xaaFF5eFe1376474a520FFe9129d8Aa8d7422AAbe",
};

const PrivateVault = {
  Vault1: "0xa74c70d0bf531171360e603e6441faeb71b117d1",
  Vault2: "0x834672c33291fd6932c1786e0c5fd4a3b921dc00",
  Vault3: "0xc1908cf72426c0d6c48a4930bef681bb6621c106",
  Vault4: "0x774c1ba3c31af51e4596fcaf9f90eaf167aee34c",
  Vault5: "0x69f69df395c05202ec935999d072fa390defc31f",
  Vault6: "0xb3c713a845378484f66e3f2ad608e3438675ff7c",
  Vault7: "0xc5782a89ad76fe0b68cd67dcc4b294fcb5307415",
  Vault8: "0xbddd3ff6f5902171faebb34e9ee084341c94a1e6",
  Vault9: "0xe6eff8492c6832c1da6f76d3cc3288951021a7b5",
  Vault10: "0x42289b0356470bdc0a93d6710f0bcf8bc0868f96",
  Vault11: "0x90aadea5b2f10c4c53139fe4cf8005ffe5ed8d47",
  Vault12: "0xbff5506a0c604cbf231646838f2f29118210e236",
  Vault13: "0xeb23a52115e5ac9ed9085a1c0b25ec29529eef3b",
};

const farms = {
  MasterChefAddress: "0xD09774e3d5Dc02fa969896c53D3Cbb5bC8900A60",
  BuddyChefAddress: "0x4B87a60fC5a94e5ac886867977e29c9711C2E903",
  LockStakingAddress: "0xa4AE0DCC89Af9855946C0b2ad4A10FF27125a9Fc",
  PriceMasterAddr: "0xB1233713FeA0984fff84c7456d2cCed43e5e48E2",
};

const abi = {
  getVaultValues:
    "function getVaultValuesInUSD() public view returns (uint vaultValue)",
  poolLength: "function poolLength() view returns (uint)",
  poolInfoMaster:
    "function poolInfo(uint256) view returns (address, uint256, uint256, uint256, uint256, uint256)",
  balance: "function balanceOf(address) view returns (uint256)",
  decimals: "function decimals() view returns (uint8)",
  getPrice: "function getPrice(address, address) view returns (uint rate)",
};

module.exports = {
  Strategies,
  PublicVault,
  PrivateVault,
  farms,
  abi,
  token,
};

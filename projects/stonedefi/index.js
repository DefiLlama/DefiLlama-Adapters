const { pool2 } = require("../helper/pool2");

const ethVaults = [
  "0x0F9F39F6AABc86c457901df26275c72de32B26A4", // WETH
  "0xFC1cF3DC111981eA4372E91f437581524f3721be", // USDC
  "0xbA3CfEa6514cF5acdDeff3167Df0b7a4337751bc", // USDT
  "0x5dC81697fC0b3752c1277D260064374E95E8A18b", // DAI
  "0xb85E3Fe36a6084985E66d704ABD4be4EA51e06cE" // aETHc
]

const ethuniv2vault = "0xafB6c80FF3CFDaE5977Df0196F3d35Cd65e3c7a3";
const ethuniv2lp = "0x00D76633A1071e9aed6158AE1a5e1C4C5dC75e54";

const stonebank = "0x63598a507B5901721097B1f1407d2Ba89D49b3d4";
const bscVaults = [
  "0x0F9F39F6AABc86c457901df26275c72de32B26A4", // WBNB
  "0xFC1cF3DC111981eA4372E91f437581524f3721be", // ETH
  "0xbA3CfEa6514cF5acdDeff3167Df0b7a4337751bc", // BTCB
  "0x5dC81697fC0b3752c1277D260064374E95E8A18b", // USDT
  "0xafB6c80FF3CFDaE5977Df0196F3d35Cd65e3c7a3", // USDC
  "0xb85E3Fe36a6084985E66d704ABD4be4EA51e06cE", // CAKE
  "0xcF0c55931629E90b222Ec9c72a9f035eCbC7E835", // MDX
  "0xa72aD1293B253522FDE41f1104aa432d7669b299", // BUSD
  "0xa004Bb9004418e8F13eAE2715cA53DdDa055d231" // DAI
]

const bsccakevault = "0x69D4E3C772e8b5D52ccd63c96D7A8a2fa6D46542";
const bsccakelp = "0x1f0af1934a4133e27469ec93a9840be99d127577";
const stbnbcakevault = "0xd478963bC6dB450D35739B96b1542240Eb606267";
const stbnbcakelp = "0x002e1655e05bd214d1e517b549e2a80bda31d2e5";

const polyVaults = [
  "0xf1EaEc1ecB26Ec987F2F7B77AAEd7a909F1aA907", // WETH
  "0x2BDC312e7847f7a59ED09899863056236a3Ce180", // USDT
  "0x33B617Fbe1A940d2E7D0a36FD359Dd1C48baf039", // USDC
  "0x237Af22431CdcC29209793573295B942920c6C3c", // WMATIC
  "0xDee0BC532a189EDfeBe4b02061443D596b529d62", // QUICK
  "0x3311Cb9E5Af0bd0e8145Da5fd5D810D2432554Ce", // SUSHI
  "0xD19DD17B99ab5e0244bfF2abB54f8e28aefc034d", // WBTC
  "0x0B0216e3c02b334e97cF0421DB9c4CFa2024DA2A" // DAI
]

const polyuniv2vault = "0x6eC3BCBB751Fe3308Dde173C9c91Bf9ea9aC7163";
const polyuniv2lp = "0x2ee7b1ddd28514d49d3bfe0bedef52ffa86d7a8b";

const avaxVaults = [
  "0x9BC91eAAb1380D3a40320B1b282b6f06e2F31Acf", // WAVAX
  "0xd2D0e78d14b34FB7639eF832C0E184B65356595b", // USDT
  "0x2aa65E137Ea0f55013A7dDc222092e46FBB51042", // USDC
  "0xD22e6f065e54DEf005aFfB08D30eF6A2AB8782f1", // DAI
  "0x44eEea93fC479ec7528A05DcDAF93046E1166F84", // WETH
  "0x145743E6386d3f08c7d4c4D39db3F77D288089Ff", // WBTC
  "0x34Ab7D654D44F9B03fc2DB1d648Eed1559064097", // LINK
  "0x24Df5da9414F9f9B98390137f692b8E2bCF2336e", //  QI
  "0x7A1b1e74f3646DE85066a501bC78edE6bc9D3FF2" //  AAVE
]

async function calcTvl(vaults, api) {
  return api.erc4626Sum({ calls: vaults, tokenAbi: 'token', balanceAbi: 'totalAssets' })
}

async function eth(api) {
  return await calcTvl(ethVaults, api);
}

async function bsc(api) {
  await calcTvl(bscVaults, api);
  const bnbStakeBalance = await api.call({ abi: 'uint256:stbnbMarketCapacityCountByBNB', target: stonebank })
  api.addGasToken(bnbStakeBalance)
}

async function polygon(api) {
  return calcTvl(polyVaults, api);
}

async function avax(api) {
  return calcTvl(avaxVaults, api);
}

function staking(stakingContract) {
  return async (api) => calcTvl([stakingContract], api)
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: eth,
    staking: staking("0xa72ad1293b253522fde41f1104aa432d7669b299"),
    pool2: pool2(ethuniv2vault, [ethuniv2lp])
  },
  bsc: {
    tvl: bsc,
    staking: staking("0xBd2861c0f43F6E8d571fcfA5a7C77D13d5695Ebf"),
    pool2: pool2([bsccakevault, stbnbcakevault], [stbnbcakelp, bsccakelp])
  },
  polygon: {
    tvl: polygon,
    staking: staking("0xA035eCd4824c4C13506D39d7041e8E0Ad156686D"),
    pool2: pool2(polyuniv2vault, [polyuniv2lp])
  },
  avax: {
    tvl: avax,
  }
}

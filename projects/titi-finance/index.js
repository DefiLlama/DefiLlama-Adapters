const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unknownTokens')

const ethTiTiToken = "0x3bdffA70f4b4E6985eED50453c7C0D4A15dcEc52";   // TiTi Token
const ethTiTiStaking = "0x5390Dbf4958F21BB317C72744c110977F4c03311";    // TiTi Staking

const eraTiTiToken = "0x4EBfb78C4780C304dff7de518db630b67e3F044b";    // TiTi Token Era
const eraTiTiStaking = "0x1B05972C2e46288201E0432262bd8e925d4fCF94";    // TiTi Staking Era

const ethereumLPs = ['0xca4AEf99b3567Dbb631DF0DCd51D446DB7eb63e5']
const eraLPs = [
  "0x574E2E833A010997840f368edF6542d8950c2788",
  "0x228D400F196760432BD8bcE74Fa1e6580aF4BF03",
  "0xd4cb4f38de684122Af261ee822Dc1437601e5424",
  "0x512f5a62eE69013643f37C12fd8Be391Db7b4550",
]
const lpReservesAbi = 'function getReserves() view returns (uint _reserve0, uint _reserve1)'

module.exports = {
  methodology: `Calculate the reserve-type assets locked in the contract, including the user's stake funds in MarketMakerFund and the reserve of TiUSD issued by the protocol, TiTi-AMMs used to provide liquidity TiUSD is not included`,
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0x49a0c2076DE4801bcadFEf78d0FA63cEC0AD1cB4",    // MAMMSwapPair
      ], tokens: [ADDRESSES.ethereum.USDC]
    }),
    staking: sumTokensExport({ owner: ethTiTiStaking, tokens: [ethTiTiToken], lps: ethereumLPs, useDefaultCoreAssets: true, restrictTokenRatio: 5000 }),
    pool2: sumTokensExport({ owner: '0x9A132b777FE7af6561BAAb60A03302C697fA8F3B', tokens: ['0x830Ce3859F98104DC600efBFAD90A65386B95404'], lps: ethereumLPs, useDefaultCoreAssets: true, restrictTokenRatio: 1000, resolveLp: true, }),
  },
  era: {
    tvl: sumTokensExport({
      owners: [
        "0xc856175575F6406b59AD6822c3114494990750DC",    // MAMMSwapPair
      ], tokens: [ADDRESSES.era.USDC]
    }),
    staking: sumTokensExport({ owner: eraTiTiStaking, tokens: [eraTiTiToken], lps: eraLPs, useDefaultCoreAssets: true, restrictTokenRatio: 5000, abis: { getReservesABI: lpReservesAbi } }),
    pool2: sumTokensExport({
      owners: [
        "0xA690DC59d6afC12d6789f46fc211DdD27f1C7f7c",
        "0x2cbCE1EFC624138326877C386692E889D8C7c834",
        "0xDc8440CdC50bEe0936bB49De82e80c2439dCEc42"
      ], tokens: eraLPs, lps: eraLPs, useDefaultCoreAssets: true, abis: { getReservesABI: lpReservesAbi }, resolveLp: true, restrictTokenRatio: 1000,
    }),
  },
}
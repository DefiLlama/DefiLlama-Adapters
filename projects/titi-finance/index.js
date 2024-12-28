const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unknownTokens')

const ethTiTiToken = "0x3bdffA70f4b4E6985eED50453c7C0D4A15dcEc52";   // TiTi Token
const ethTiTiStaking = "0x5390Dbf4958F21BB317C72744c110977F4c03311";    // TiTi Staking

const eraTiTiToken = "0x4EBfb78C4780C304dff7de518db630b67e3F044b";    // TiTi Token Era
const eraTiTiStaking = "0x1B05972C2e46288201E0432262bd8e925d4fCF94";    // TiTi Staking Era

const baseTiTiToken = "0x57bec9e5b5f2e3c4c925949f516527e8fbc83cf2";    // TiTi Token Era
const baseTiTiStaking = "0xbc8007792690621a3217196217337129161Db176";    // TiTi Staking Era

const ethereumLPs = ['0xca4AEf99b3567Dbb631DF0DCd51D446DB7eb63e5']
const eraLPs = [
  "0x574E2E833A010997840f368edF6542d8950c2788",
  "0x228D400F196760432BD8bcE74Fa1e6580aF4BF03",
  "0xd4cb4f38de684122Af261ee822Dc1437601e5424",
  "0x512f5a62eE69013643f37C12fd8Be391Db7b4550",
  "0xEDbC01C6eF70Ef3c1448d543A2Ed438a9d564d93",
  "0x64FD534e47aF3B234f7476A7C26B611c05d475a9",
  "0x10095115B58F5562A16476435363bf56E7dBAD20"
]
const baseLPs = ['0x19bdf948b8E72d0Fa61156f2119CE0dfb7D40D3b']

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
        "0xDc8440CdC50bEe0936bB49De82e80c2439dCEc42",
        "0x68524201E392AEB91d256fa67a3A2b2cdCdcECf9",
        "0x959A0715698540f03FCBb2A54b4C98a8032Da3a5",
        "0xf65279AC29f92931F0EDED9dD4bb61A176b236Ca"
      ], tokens: eraLPs, lps: eraLPs, useDefaultCoreAssets: true, abis: { getReservesABI: lpReservesAbi }, resolveLp: true, restrictTokenRatio: 1000,
    }),
  },
  base: {
    tvl: sumTokensExport({
      owners: [
        "0x159089d1b385572Fdc2a42Bf7664309f6eEf5Edc",    // MAMMSwapPair
      ], tokens: [ADDRESSES.base.USDbC]
    }),
    staking: sumTokensExport({ owner: baseTiTiStaking, tokens: [baseTiTiToken], lps: baseLPs, useDefaultCoreAssets: true, restrictTokenRatio: 5000 }),
    pool2: sumTokensExport({ owner: '0xF58EC1aB2b0128286DeA0A2B31BfFbeE4EFE4b75', tokens: ['0x19bdf948b8E72d0Fa61156f2119CE0dfb7D40D3b'], lps: baseLPs, useDefaultCoreAssets: true, restrictTokenRatio: 1000, resolveLp: true, }),
  },
}
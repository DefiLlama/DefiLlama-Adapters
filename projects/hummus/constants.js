const ADDRESSES = require('../helper/coreAssets.json')
/**
 * lp token addresses
 */
// USD1
const USD1_mUSDC_LP = "0x9E3F3Be65fEc3731197AFF816489eB1Eb6E6b830";
const USD1_mUSDT_LP = "0x9F51f0D7F500343E969D28010C7Eb0Db1bCaAEf9";
const USD1_mDAI_LP = "0x0CAd02c4c6fB7c0d403aF74Ba9adA3bf40df6478";
const USD1_mBUSD_LP = "0x919395161Dd538aa0fB065A8EaC878B18D07FbCd"
const USD1_DAI_LP = "0xd5A0760D55ad46B6A1C46D28725e4C117312a7aD"; // deprecated
// USD2 - MAI
const USD2_mUSDC_LP = "0x8a19e755610aECB3c55BdE4eCfb9185ef0267400";
const USD2_MAI_LP = "0x3Eaa426861a283F0E46b6411aeB3C3608B090E0e";

/**
 * token addresses
 */
const mUSDC = ADDRESSES.metis.m_USDC;
const mUSDT = ADDRESSES.metis.m_USDT;
const mDAI = "0x4c078361FC9BbB78DF910800A991C7c3DD2F6ce0";
const mBUSD = "0xb809cda0c2f79f43248C32b5DcB09d5cD26BbF10"
const DAI = ADDRESSES.metis.DAI; // deprecated
const MAI = ADDRESSES.moonbeam.MAI

module.exports = {
  mBUSD: {
    id: "binance-usd",
    addresses: [
      {
        token: mBUSD,
        lpTokens: [USD1_mBUSD_LP],
      },
    ],
  },
  mDAI: {
    id: "dai",
    addresses: [
      {
        token: mDAI,
        lpTokens: [USD1_mDAI_LP],
      },
    ],
  },
  mUSDC: {
    id: "usd-coin",
    addresses: [
      {
        token: mUSDC,
        lpTokens: [
          USD1_mUSDC_LP,
          USD2_mUSDC_LP
        ],
      },
    ],
  },
  mUSDT: {
    id: "tether",
    addresses: [
      {
        token: mUSDT,
        lpTokens: [USD1_mUSDT_LP],
      },
    ],
  },
  MAI: {
    id: "mimatic",
    addresses: [
      {
        token: MAI,
        lpTokens: [USD2_MAI_LP]
      }
    ]
  }
};

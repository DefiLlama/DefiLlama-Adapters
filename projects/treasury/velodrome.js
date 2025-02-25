const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const team = "0xb074ec6c37659525EEf2Fb44478077901F878012";
const treasury = "0xe7D7ce84D45e43F06cD5CaA1d9c42374b8776fb0";

const tokens = [
  nullAddress,
  ADDRESSES.optimism.OP, // OP
  ADDRESSES.optimism.USDC, // USDC
  ADDRESSES.tombchain.FTM, // WETH
  "0x73cb180bf0521828d8849bc8CF2B920918e23032", // USD+
  ADDRESSES.optimism.sUSD, // sUSD
  ADDRESSES.optimism.sETH, // sETH
  "0xB153FB3d196A8eB25522705560ac152eeEc57901", // MIM
  ADDRESSES.optimism.USDT, // USDT
  "0xd52f94DF742a6F4B4C8b033369fE13A41782Bf44", // L2DAO
  "0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED", // agEUR
  "0xc3864f98f2a61A7cAeb95b039D031b4E2f55e0e9", // OpenX
  "0x61BAADcF22d2565B0F471b291C475db5555e0b76", // AELIN
  "0x79AF5dd14e855823FA3E9ECAcdF001D99647d043", // jEUR
  "0xc40F949F8a4e094D1b49a23ea9241D289B7b2819", // LUSD
  ADDRESSES.moonbeam.MAI, // MAI
  "0x3F56e0c36d275367b8C502090EDF38289b3dEa0d", // QI
  "0x9Bcef72be871e61ED4fBbc7630889beE758eb81D", // rETH
  "0xE3AB61371ECc88534C522922a026f2296116C109", // SPELL
  "0xcB59a0A753fDB7491d5F3D794316F1adE197B21E", // TUSD
  ADDRESSES.optimism.WSTETH, // wstETH
];

const ownTokens = [
  "0x3c8B650257cFb5f272f799F5e2b4e65093a11a05", // VELO
  "0xe8537b6FF1039CB9eD0B71713f697DDbaDBb717d", // vAMM-VELO/USDC
];

module.exports = treasuryExports({
  optimism: {
    tokens, 
    ownTokens,
    owners: [team, treasury],
    ownTokenOwners: [team, treasury]
  },
});

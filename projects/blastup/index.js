const { staking } = require("../helper/staking");
const ADDRESSES = require("../helper/coreAssets.json");

const stakingpool = "0x0E84461a00C661A18e00Cab8888d146FDe10Da8D";

const blastup = "0x59c159e5a4f4d1c86f7abdc94b7907b7473477f6";
const lockedBlastup = "0xf8a5d147a3a3416ab151758d969eff15c27ab743";
const stakingContracts = [
  "0x115ebda9489cf250ff0e8ea9f473c96c222a874c", // LockedBlastUPStaking 6%
  "0x2e36e05e7ecd36164ada93752a9a82c1efaa9582", // LockedBlastUPStaking 12%
  "0xf399110e921d25dd1ad6a0eef020991df3dd0cd3", // LockedBlastUPStaking 18%
  "0xb0d7902685a4f4d916a21a0ed721298d590cd9cd", // BlastUPStaking 6%
  "0x520bf8e72f9e808102eb421fb03764624d1984e9", // BlastUPStaking 12%
  "0xc3524c6fdce9e60c1a1ddce54953973264097542", // BlastUPStaking 18%
]

module.exports = {
  blast: {
    tvl: staking([stakingpool], [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH]),
    staking: staking(stakingContracts, [blastup, lockedBlastup]),
  },
  hallmarks: [
    [1717575654, "IDO Farming Launch"],
  ],
}
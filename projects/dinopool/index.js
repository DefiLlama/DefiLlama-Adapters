const sdk = require("@defillama/sdk")

const { tombTvl } = require('../helper/tomb')

const bond = "0x7091002B330D8054cb8584e5057451Ba983b975E";
const share = "0xC21718b8a93529d33E7b5dCdFF439402c47428aC";
const boardroom = "0x2fa7259b002ac24e24f27bc5b83f186e37738b75";
const rewardPool = "0xd04b9FCF5bC9Cd046233f4ead8aDdcD56D2eA453";

const lps = [
  "0x0526467a2cB9DF86e1FA8f0abA3E4ab090126324",
  "0xFc8281ddAE23612D60A242c10c35EE5E0a4c1541",
];

module.exports = {
    ...tombTvl(bond, share, rewardPool, boardroom, lps, "cronos", undefined, false, lps[1])
};

module.exports.deadFrom = "2023-05-30"
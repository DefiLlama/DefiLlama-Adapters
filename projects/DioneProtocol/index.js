const { getBalance } = require("../helper/unwrapLPs");

/**
 * DioneProtocol Adapter on Odyssey network.
 * Queries the blockchain to sum Dione in key contracts.
 * @returns {Promise<Object>} An object with the TVL in 'dione'.
 */
async function tvl(api) {
  try {
    const lockedDioneContracts = [
      "0x73c2D7b647839B1367641e4559EE225801165368", // Migration airdrop + Staking rewards
      "0xeF9C9663e573Ab97013b979F057eDccEa429a849", // Team vesting
      "0xD21A82BB789dCa05271711902F9E7FDDE158Bfd7", // Governance vesting
      "0xfB4ed819a1F59b792025e652a048005da9610EC9", // Foundation vesting
      "0xeFee93a405F39780E571eC8376b61D48B3C764AB", // Token sales vesting
      "0xb2e19E0Ae23F0265824b77C49F615130061854C3", // Airdrop vesting
      "0xbCEE7Fb45f7E898DA9Db4b4437D8bD5700c1af01", // Grants vesting
      "0xD72C3d7957950197EcAa68d41E2E6803b61874E3", // LP multisig
    ];

    let totalDione = 0n;
    for (const contract of lockedDioneContracts) {
      const balance = await getBalance(contract, 'odyssey', api.chainBlocks.odyssey);
      totalDione += BigInt(balance);
    }

    return { 'dione': totalDione };
  } catch (error) {
    console.error("Error calculating TVL from contracts:", error);
    return { 'dione': 0n };
  }
}

module.exports = {
  methodology: "TVL is calculated by summing Dione balances in key protocol contracts.",
  
  odyssey: {
    tvl,
  },

  timetravel: true,  

  start: 1729814400, // Odyssey migration

  hallmarks: [
    [1729814400, "Odyssey Migration"],
  ]
};
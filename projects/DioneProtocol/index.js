const { getBalance } = require("../helper/sdk");

/**
 * DioneProtocol Adapter on Odyssey network.
 * Queries the blockchain to sum Dione in key contracts.
 * @returns {Promise<Object>} An object with the TVL in 'dione'.
 */
async function tvl(api) {
  try {
    // Key contracts where Dione is locked
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

    // Sum up all the Dione tokens in these contracts
    const balances = await api.multiCall({
      abi: 'function balanceOf(address) view returns (uint256)',
      calls: lockedDioneContracts.map(addr => ({ target: addr })),
    });

    // Sum up the balances
    const totalDione = balances.reduce((sum, balance) => sum + BigInt(balance.output), 0n);

    return { 'dione': totalDione };
  } catch (error) {
    console.error("Error calculating TVL from contracts:", error);
    return { 'dione': 0n }; // Return zero TVL in case of any error
  }
}

// Export the TVL function and metadata for the adapter
module.exports = {
  methodology: "TVL is calculated by summing Dione balances in key protocol contracts including vesting and multisig wallets.",
  
  // Define the chain and the TVL calculation function
  odyssey: {
    tvl,
  },

  timetravel: true,  

  start: 1729814400, // October 30, 2024, at 00:00:00 UTC, Odyssey migration

  hallmarks: [
    [1729814400, "Odyssey Migration"], // Migration to the new chain
  ]
};
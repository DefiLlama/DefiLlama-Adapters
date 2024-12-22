const sdk = require("@defillama/sdk");

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
      "0x622B1853A65C582b8B65af56d9FaBcfeE46a68eE", // Team vesting contract
      "0x8a2708cF88bf7951b3f4FEC8fC8Bda3016dE8381", // Governance vesting contract
      "0x4F1e5D576C2769Cc20b7F993f88e493848C612fe", // Foundation vesting contract
      "0x772E0678D3EdbEE073d336b303B88E3650a266eb", // Token Sales vesting contract
      "0x474D39292CDe9b07A444fd128ad6C5876de26421", // Airdrops vesting contract
      "0xdD9A2030665669d61a959fDB03DF8399f58cec6e", // Grants vesting contract
    ];

    let totalDione = 0n;
    
    for (const contract of lockedDioneContracts) {
      try {
        const balance = await sdk.api.eth.getBalance({
          target: contract,
          chain: 'odyssey'
        });

        console.log(`Balance for ${contract}:`, balance.output);
        totalDione += BigInt(balance.output);
      } catch (error) {
        console.error(`Error fetching balance for ${contract}:`, error.message);
      }
    }

    console.log("Total Dione TVL:", totalDione.toString());
    return { 'dione': totalDione };
  } catch (error) {
    console.error("Error calculating TVL from contracts:", error);
    return { 'dione': 0n };
  }
}

module.exports = {
  methodology: "TVL is calculated by summing Dione balances in key protocol contracts, including vesting contracts.",
  
  odyssey: {
    tvl,
  },

  timetravel: true,  

  start: 1729814400,

  hallmarks: [
    [1729814400, "Odyssey Migration"],
  ]
};
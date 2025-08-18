const { getConnection } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

// Adrastea validator accounts
const VOTE_ACCOUNT = "adraBKLNY3DL3pg6SJRDYiMA8BsznaWpUdE42X41gbP";
const IDENTITY_ACCOUNT = "adramSYKBv1yHoZTub4kepcmF5LybPxwyJcsz4fpfi7";

async function tvl() {
  const connection = getConnection();
  
  try {
    // Get all vote accounts from the network
    const voteAccounts = await connection.getVoteAccounts();
    
    // Find Adrastea validator in current or delinquent validators
    const adrasteaValidator = voteAccounts.current.find(va => va.votePubkey === VOTE_ACCOUNT) || 
                             voteAccounts.delinquent.find(va => va.votePubkey === VOTE_ACCOUNT);
    
    if (adrasteaValidator) {
      // Convert lamports to SOL
      const totalStake = adrasteaValidator.activatedStake / 1e9;
      return {
        solana: totalStake,
      };
    } else {
      console.log("Adrastea validator not found in vote accounts");
      return { solana: 0 };
    }
  } catch (error) {
    console.error("Error fetching Adrastea validator stake:", error);
    return { solana: 0 };
  }
}

module.exports = {
  timetravel: false,
  methodology: "Sums all SOL staked to Adrastea validator vote account: " + VOTE_ACCOUNT,
  solana: {
    tvl,
  },
};
const ADDRESSES = require('../helper/coreAssets.json')
const { getConnection } = require("../helper/solana");

// Adrastea validator accounts
const VOTE_ACCOUNT = "adraBKLNY3DL3pg6SJRDYiMA8BsznaWpUdE42X41gbP";

async function tvl(api) {
  const connection = getConnection();

  // Get all vote accounts from the network
  const voteAccounts = await connection.getVoteAccounts();

  // Find Adrastea validator in current or delinquent validators
  const adrasteaValidator = voteAccounts.current.find(va => va.votePubkey === VOTE_ACCOUNT) ||
    voteAccounts.delinquent.find(va => va.votePubkey === VOTE_ACCOUNT);

  api.add(ADDRESSES.solana.SOL, adrasteaValidator.activatedStake)
}

module.exports = {
  timetravel: false,
  methodology: "Sums all SOL staked to Adrastea validator vote account: " + VOTE_ACCOUNT,
  solana: {
    tvl,
  },
};
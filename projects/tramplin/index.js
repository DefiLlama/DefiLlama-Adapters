const { getConnection } = require("../helper/solana");
const TRAMPLIN_VOTE_ACCOUNT = "TRAMp1Z9EXyWQQNwNjjoNvVksMUHKioVU7ky61yNsEq";

async function tvl() {
  const connection = getConnection();
  const voteAccounts = await connection.getVoteAccounts();
  const validator = voteAccounts.current.find(va => va.votePubkey === TRAMPLIN_VOTE_ACCOUNT) ||
    voteAccounts.delinquent.find(va => va.votePubkey === TRAMPLIN_VOTE_ACCOUNT);
  return { solana: validator.activatedStake / 1e9 }
}

module.exports = {
  timetravel: false,
  methodology: "Sums all SOL staked to Tramplin validator vote account: TRAMp1Z9EXyWQQNwNjjoNvVksMUHKioVU7ky61yNsEq",
  solana: {
    tvl,
  },
};
const { Program } = require("@project-serum/anchor");
const { getProvider, getMultipleAccounts, } = require("../helper/solana");
const partialIdl = require("./partialIdl");

const PROGRAM_ADDR = "unpXTU2Ndrc7WWNyEhQWe4udTzSibLPi25SXv2xbCHQ";
const POOL_ADDR = "FypPtwbY3FUfzJUtXHSyVRokVKG2jKtH29FmK4ebxRSd";
const SOL_RESERVES = "3rBnnH9TTgd3xwu48rnzGsaQkSr1hR64nY71DrDt6VrQ";

async function tvl() {
  const program = new Program(partialIdl, PROGRAM_ADDR, getProvider());
  const [poolAccount, reservesAccount] = await getMultipleAccounts([
    POOL_ADDR,
    SOL_RESERVES,
  ]);
  const pool = program.coder.accounts.decode("pool", poolAccount.data)
  return {
    solana: (reservesAccount.lamports + pool.incomingStake.toNumber()) / 1e9,
  }
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing total incoming stake from stake accounts that were instant unstaked but not yet reclaimed, and the pool's SOL reserves.",
  solana: { tvl, },
}

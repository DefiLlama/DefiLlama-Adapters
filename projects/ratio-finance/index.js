const { PublicKey } = require('@solana/web3.js')
const { Program, utils } = require("@project-serum/anchor");
const BigNumber = require("bignumber.js");
const IDL = require("./ratio-state.json");
const { toUSDTBalances } = require('../helper/balances')
const { getProvider } = require('../helper/solana')

const programId = new PublicKey("RFLeGTwFXiXXETdJkZuu9iKgXNkYbywLpTu1TioDsDQ");

const encodeSeedString = (seedString) => Buffer.from(utils.bytes.utf8.encode(seedString));

const constructProgram = async (provider) => {
  return new Program(IDL, programId, provider);
};

const findPDA = async (seeds) => {
  return (await PublicKey.findProgramAddress(seeds, programId))[0];
};

const findGlobalStatePDA = async (globalStateSeed) => {
  const seed = encodeSeedString(globalStateSeed);
  return findPDA([seed]);
};

async function tvl() {
  const provider = getProvider();
  const program = await constructProgram(provider);
  const globalStateKey = await findGlobalStatePDA("GLOBAL_STATE_SEED");

  const globalStateAccInfo = await program.account.globalState.fetch(globalStateKey);
  const tvlUsd = new BigNumber(globalStateAccInfo.tvlUsd.toString()).div(1e6).toString(10);
  return toUSDTBalances(tvlUsd)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology:
    "To obtain the Ratio Finance TVL we make on-chain calls",
};
const { getUniqueAddresses } = require('../helper/utils');
const { call, sumTokens } = require('../helper/chain/near');
const { sumTokens2, getProvider } = require('../helper/solana');
const { sumTokens2: evmSumTokens2 } = require("../helper/unwrapLPs")
const { Program } = require('@coral-xyz/anchor');
const { PublicKey } = require('@solana/web3.js');

const ALLSTAKE_NEAR_CONTRACT = 'allstake.near';
const ALLSTAKE_SOLANA_PROGRAM = new PublicKey('a11zL6Uxue6mYG3JD3APmnVhS4RVjGTJZbENY7L6ZfD');
const ALLSTAKE_SOLANA_PROGRAM_IDL = require('./idls/strategy_manager.json');
const ALLSTAKE_ETHEREUM_STRATEGY_MANAGER_CONTRACT = '0x344F8B88357A710937f2b3db9d1B974B9a002afB';

async function ethereumTvl(api) {
  const strategies = await api.fetchList({  lengthAbi: 'strategiesLen', itemAbi: 'strategies', target: ALLSTAKE_ETHEREUM_STRATEGY_MANAGER_CONTRACT})
  const tokens = await api.multiCall({ abi: 'address:underlying', calls: strategies });
  return evmSumTokens2({ api, tokensAndOwners2: [tokens, strategies] });
}

async function nearTvl() {
  const strategies = await call(ALLSTAKE_NEAR_CONTRACT, 'get_strategies', {});
  const tokens = getUniqueAddresses(strategies.map(s => s.underlying_token));
  return sumTokens({
    owners: [ALLSTAKE_NEAR_CONTRACT],
    tokens,
  });
}

async function solanaTvl() {
  const provider = getProvider();
  const programId = ALLSTAKE_SOLANA_PROGRAM;
  // const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(ALLSTAKE_SOLANA_PROGRAM_IDL, programId, provider);
  const state = await program.account.strategyManager.all();
  const strategyManager = state[0].account.data.v1[0];
  const tokens = getUniqueAddresses(strategyManager.strategyMints.slice(0, strategyManager.strategyMintsLen).map(mint => mint.toBase58()), true);

  const tokensAndOwners = [];
  for (const token of tokens) {
    const pubKey = new PublicKey(token);
    const owner = PublicKey.findProgramAddressSync(
      [
        Buffer.from('STRATEGY'),
        pubKey.toBuffer(),
      ],
      ALLSTAKE_SOLANA_PROGRAM
    )[0].toBase58();
    tokensAndOwners.push([token, owner]);
  }

  return sumTokens2({
    tokensAndOwners
  });
}

module.exports = {
  near: {
    tvl: nearTvl,
  },
  solana: {
    tvl: solanaTvl,
  },
  ethereum: {
    tvl: ethereumTvl,
  },
  timetravel: false,
  methodology: 'Summed up all the tokens deposited in the contract',
}

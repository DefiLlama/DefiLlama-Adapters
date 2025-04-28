const { getUniqueAddresses } = require('../helper/utils');
const { call, sumTokens, } = require('../helper/chain/near');
const { sumTokens2, getConnection } = require('../helper/solana');
const { sumTokens2: evmSumTokens2 } = require("../helper/unwrapLPs")
const { PublicKey } = require('@solana/web3.js');

const ALLSTAKE_NEAR_CONTRACT = 'allstake.near';
const ALLSTAKE_SOLANA_PROGRAM = new PublicKey('a11zL6Uxue6mYG3JD3APmnVhS4RVjGTJZbENY7L6ZfD');
const ALLSTAKE_ETHEREUM_STRATEGY_MANAGER_CONTRACT = '0x344F8B88357A710937f2b3db9d1B974B9a002afB';

async function ethereumTvl(api) {
  const strategies = await api.fetchList({ lengthAbi: 'strategiesLen', itemAbi: 'strategies', target: ALLSTAKE_ETHEREUM_STRATEGY_MANAGER_CONTRACT })
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
  const result = await getConnection().getProgramAccounts(ALLSTAKE_SOLANA_PROGRAM, {
    encoding: "base64",
    // We only care about the strategy addresses.
    dataSlice: { offset: 0, length: 0 },
    filters: [
      { dataSize: 316 },
    ],
  });
  const owners = result.map(({ pubkey }) => pubkey);

  return sumTokens2({ owners });
}

module.exports = {
  near: {
    tvl: nearTvl,
  },
  solana: {
    tvl: solanaTvl
  },
  ethereum: {
    tvl: ethereumTvl,
  },
  timetravel: false,
  methodology: 'Summed up all the tokens deposited in the contract',
}

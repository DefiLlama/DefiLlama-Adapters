const { getBalance, sumTokens } = require('../helper/chain/cosmos');
const abi = require('./abi.json');

// Configuration from ABI
const { contracts, tokens, protocol } = abi;
const JURIS_STAKING_CONTRACT = contracts.staking;
const JURIS_TOKEN_CONTRACT = contracts.token;

// TVL function
async function tvl(api) {
  // Sum native coins held by staking contract
  await sumTokens({
    api,
    owner: JURIS_STAKING_CONTRACT,
    tokens: [tokens.LUNC.address, tokens.USTC.address] // ["uluna", "uusd"]
  });

  // Add JURIS CW20 (process decimals if using coingeckoId key)
  const jurisBalance = await getBalance({
    token: JURIS_TOKEN_CONTRACT,
    owner: JURIS_STAKING_CONTRACT,
    chain: 'terra'
  });

  if (jurisBalance > 0) {
    // Option 1: By address (SDK will handle decimals/price)
    api.add(JURIS_TOKEN_CONTRACT, jurisBalance);

    // Option 2: By coingeckoId (manual decimals, required for non-ERC20)
    // api.add(tokens.JURIS.coingeckoId, jurisBalance / (10 ** tokens.JURIS.decimals));
  }
}

async function staking(api) {
  // Only governance (JURIS) token
  const jurisBalance = await getBalance({
    token: JURIS_TOKEN_CONTRACT,
    owner: JURIS_STAKING_CONTRACT,
    chain: 'terra'
  });

  if (jurisBalance > 0) {
    api.add(JURIS_TOKEN_CONTRACT, jurisBalance);
    // Or manually by coingeckoId
    // api.add(tokens.JURIS.coingeckoId, jurisBalance / (10 ** tokens.JURIS.decimals));
  }
}

module.exports = {
  methodology: `${protocol.description}. TVL includes ${tokens.JURIS.symbol}, ${tokens.LUNC.symbol}, and ${tokens.USTC.symbol} in staking contracts on Terra Classic.`,
  timetravel: false,
  misrepresentedTokens: false,
  doublecounted: false,
  start: 1707782400, // launch date
  terra: {
    tvl,
    staking
  }
};

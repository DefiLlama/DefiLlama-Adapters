const { sumTokens } = require('../helper/chain/cosmos');
const abi = require('./abi.json');

const { contracts, tokens } = abi;

async function tvl(api) {
  console.log(`[DefiLlama-Juris] Starting TVL calculation`);
  console.log(`[DefiLlama-Juris] Staking Contract:`, contracts.staking);
  console.log(`[DefiLlama-Juris] Token List:`, [
    tokens.LUNC.address,
    tokens.USTC.address,
    tokens.JURIS.address
  ]);

  // Log query for each token type
  for (let token of [tokens.LUNC.address, tokens.USTC.address, tokens.JURIS.address]) {
    console.log(`[DefiLlama-Juris] Querying balance for token:`, token);
  }

  await sumTokens({
    api,
    owner: contracts.staking,
    tokens: [
      tokens.LUNC.address,
      tokens.USTC.address,
      tokens.JURIS.address
    ]
  });

  // After sumTokens, print out balances tracked by the api helper
  if (api.balances) {
    console.log(`[DefiLlama-Juris] Fetched balances:`, api.balances);
  } else {
    console.log(`[DefiLlama-Juris] No balances returned`);
  }
}

async function staking(api) {
  console.log(`[DefiLlama-Juris] Starting staking calculation`);
  console.log(`[DefiLlama-Juris] Querying token:`, tokens.JURIS.address);

  await sumTokens({
    api,
    owner: contracts.staking,
    tokens: [tokens.JURIS.address]
  });

  if (api.balances) {
    console.log(`[DefiLlama-Juris] Staking balances:`, api.balances);
  } else {
    console.log(`[DefiLlama-Juris] No staking balances returned`);
  }
}

module.exports = {
  methodology: `${abi.protocol.description}. TVL represents total value in JURIS, LUNC, and USTC locked in Juris Protocol staking contract on Terra Classic.`,
  timetravel: false,
  misrepresentedTokens: false,
  doublecounted: false,
  start: 1707782400,
  terra: {
    tvl,
    staking
  }
};

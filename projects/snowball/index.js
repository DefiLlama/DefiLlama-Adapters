const sdk = require('@defillama/sdk');
const { request, gql } = require("graphql-request");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { isLP } = require('../helper/utils.js');

const abi = require('./abi.json')

const API_URL = `https://api.snowapi.net/graphql`
const OLD_API_URL = `https://snob-backend-api.herokuapp.com/graphql`

const query = gql`
query {
  SnowglobeContracts {
    pair
    snowglobeAddress
  }
  DeprecatedContracts {
    kind
    pair
    contractAddresses
  }
  StablevaultContracts {
    swapAddress
  }
}
`;

const XSNOB_CONTRACT = '0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E';
const SNOB_TOKEN_CONTRACT = '0xc38f41a296a4493ff429f1238e030924a1542e50';

async function staking(timestamp, block, chainBlocks) {
  const balances = {};
  await sdk.api.abi.call({
    target: SNOB_TOKEN_CONTRACT,
    params: [XSNOB_CONTRACT],
    block: chainBlocks.avax,
    chain: 'avax',
    abi: 'erc20:balanceOf'
  }).then(stakedSnob => {
    sdk.util.sumSingleBalance(balances, `avax:${SNOB_TOKEN_CONTRACT}`, stakedSnob.output);
  });
  return balances;
}

async function getStableVaultBalances(balances, stablevaults, block) {
  await Promise.all(stablevaults.map(async (vault) => {
    await sdk.api.abi.multiCall({
      calls: [0, 1, 2, 3].map(num => ({
        target: vault.swapAddress,
        params: [num]
      })),
      abi: abi.getToken,
      block,
      chain: 'avax'
    }).then(async tokens => {
      await sdk.api.abi.multiCall({
        calls: tokens.output.filter(t => t.output != null).map(token => ({
          target: token.output,
          params: [vault.swapAddress]
        })),
        abi: 'erc20:balanceOf',
        block,
        chain: 'avax'
      }).then(tokenBalances => {
        const balancesToAdd = {};
        sdk.util.sumMultiBalanceOf(balancesToAdd, tokenBalances);
        Object.entries(balancesToAdd).forEach(balance => {
          sdk.util.sumSingleBalance(balances, `avax:${balance[0]}`, balance[1]);
        });
      });
    });
  }));
}

async function getSnowglobeBalances(balances, snowglobes, block) {
  const singleSidedPairs = {
    calls: snowglobes.filter((globe) => !globe.pair.includes("-")).map(globe => ({
      target: globe.snowglobeAddress
    })),
    block,
    chain: 'avax'
  }
  const [tokens, tokenBalances] = await Promise.all([
    sdk.api.abi.multiCall({
      ...singleSidedPairs,
      abi: abi.token
    }),
    sdk.api.abi.multiCall({
      ...singleSidedPairs,
      abi: abi.balance
    })
  ])
  await Promise.all(tokens.output.map((token, idx) => {
    sdk.util.sumSingleBalance(balances, `avax:${token.output}`, tokenBalances.output[idx].output);
  }));

  snowglobes = snowglobes.filter((globe) => globe.pair.includes("-"));
  const globes = {
    calls: snowglobes.map(globe => ({
      target: globe.snowglobeAddress,
    })),
    block,
    chain: 'avax'
  };
  const [lpTokens, lpTokenBalances] = await Promise.all([
    sdk.api.abi.multiCall({
      ...globes,
      abi: abi.token,
    }),
    sdk.api.abi.multiCall({
      ...globes,
      abi: abi.balance,
    }),
  ]);

  const tokenNames = await sdk.api.abi.multiCall({
    abi: 'erc20:symbol',
    calls: lpTokens.output.map(t => ({
      target: t.output
    })),
    block,
    chain: 'avax'
  })

  const lpPositions = [];
  for (let i = 0; i < tokenNames.output.length; i++) {
    if (isLP(tokenNames.output[i].output , tokenNames.output[i].input.target, 'avax')) {
      lpPositions.push({
        token: lpTokens.output[i].output,
        balance: lpTokenBalances.output[i].output
      })
    } else {
      // these are all axial LPs
      sdk.util.sumSingleBalance(balances, 'avax:0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', (lpTokenBalances.output[i].output / 10 ** 12).toFixed(0))
    }
  }

  await unwrapUniswapLPs(balances, lpPositions, block, 'avax', (addr) => `avax:${addr}`, [], true);
}

async function tvl(_timestamp, _ethereumBlock, chainBlocks) {
  const balances = {}
  const block = chainBlocks['avax'];

  let data;
  try {
    data = await request(API_URL, query);
  } catch {
    data = await request(OLD_API_URL, query);
  }
  const deprecatedSnowglobes = data.DeprecatedContracts.filter(contract => contract.kind === "Snowglobe").map(contract => ({ pair: contract.pair, snowglobeAddress: contract.contractAddresses[0] }));
  const deprecatedStablevaults = data.DeprecatedContracts.filter(contract => contract.kind === "Stablevault").map(contract => ({ swapAddress: contract.contractAddresses[2] }));

  await getStableVaultBalances(balances, data.StablevaultContracts.concat(deprecatedStablevaults), block);
  await getSnowglobeBalances(balances, data.SnowglobeContracts.concat(deprecatedSnowglobes), block);

  return balances;
}

module.exports = {
  avalanche: {
    tvl,
    staking
  }
} // node test.js projects/snowball/index.js

const sdk = require('@defillama/sdk');

const SONICX_FACTORY = '0x0569F2A6B281b139bC164851cf86E4a792ca6e81'; // Sonicxswap factory address
const SONICX_ROUTER = '0x8885b3cfF909e129d9F8f75b196503F4F8B1A351'; // Sonicxswap router address

async function tvl(_, _b, { sonic: block }) {
  const balances = {};
  
  // Example: Get all pairs from factory and sum their token balances
  const pairLength = (
    await sdk.api.abi.call({
      target: SONICX_FACTORY,
      chain: 'sonic',
      abi: {
        name: 'allPairsLength',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        inputs: [],
        stateMutability: 'view',
        type: 'function',
      },
      block,
    })
  ).output;

  const pairCalls = Array.from({ length: Number(pairLength) }, (_, i) => ({
    target: SONICX_FACTORY,
    params: [i],
    abi: {
      name: 'allPairs',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    chain: 'sonic',
    block,
  }));

  const { output: pairAddresses } = await sdk.api.abi.multiCall({
    calls: pairCalls,
    chain: 'sonic',
    block,
  });

  const tokenCalls = pairAddresses.flatMap(({ output: pair }) => ([
    {
      target: pair,
      abi: 'erc20:token0',
      chain: 'sonic',
      block,
    },
    {
      target: pair,
      abi: 'erc20:token1',
      chain: 'sonic',
      block,
    },
  ]));

  const tokenResults = await sdk.api.abi.multiCall({
    calls: tokenCalls,
    chain: 'sonic',
    block,
  });

  const tokens = tokenResults.output;
  const token0s = tokens.filter((_, i) => i % 2 === 0);
  const token1s = tokens.filter((_, i) => i % 2 === 1);

  const balanceCalls = [];

  for (let i = 0; i < pairAddresses.length; i++) {
    const pair = pairAddresses[i].output;
    const token0 = token0s[i].output;
    const token1 = token1s[i].output;

    balanceCalls.push(
      {
        target: token0,
        params: [pair],
        abi: 'erc20:balanceOf',
        chain: 'sonic',
        block,
      },
      {
        target: token1,
        params: [pair],
        abi: 'erc20:balanceOf',
        chain: 'sonic',
        block,
      }
    );
  }

  const balancesRaw = await sdk.api.abi.multiCall({
    calls: balanceCalls,
    chain: 'sonic',
    block,
  });

  balancesRaw.output.forEach((result) => {
    if (result.success) {
      sdk.util.sumSingleBalance(balances, result.input.target, result.output);
    }
  });

  return balances;
}

module.exports = {
  methodology: 'TVL is calculated by summing the tokens in all Sonicxswap liquidity pools.',
  start: 1919191, // Replace with actual Sonicxswap deployment block on Sonic
  sonic: {
    tvl,
  },
};


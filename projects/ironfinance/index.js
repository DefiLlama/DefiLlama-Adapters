const sdk = require('@defillama/sdk');
const abiPolygon = require('./abi-polygon.json');

const Contracts = {
  polygon: {
    pools: {
      is3usd: '0x837503e8a8753ae17fb8c8151b8e6f586defcb57',
      ispusd: '0x4a783cd1b4543559ece45db47e07e0cb59e55c09',
      isxusd: '0xe440ccc13e6f273c110cf3cf4087c23a66b8e872',
      isiron: '0xCaEb732167aF742032D13A9e76881026f91Cd087',
    },
    ignoredLps: ['0xb4d09ff3da7f9e9a2ba029cb0a81a989fd7b8f17'],
    lend: {
      ironController: '0xF20fcd005AFDd3AD48C85d0222210fe168DDd10c',
    },
  },
};

const MaticAddress = '0x0000000000000000000000000000000000001010'

const poolTvl = async (poolAddress, block) => {
  const [balances, tokens] = await Promise.all([
    sdk.api.abi.call({
      target: poolAddress,
      abi: abiPolygon.IronSwap.getTokenBalances,
      chain: 'polygon',
      block,
    }),
    sdk.api.abi.call({
      target: poolAddress,
      abi: abiPolygon.IronSwap.getTokens,
      chain: 'polygon',
      block,
    }),
  ]);

  const sum = {};
  tokens.output.forEach((token, i) => {
    if (!Contracts.polygon.ignoredLps.includes(token.toLowerCase())) {
      sdk.util.sumSingleBalance(sum, `polygon:${token}`, balances.output[i]);
    }
  });

  return sum;
};

const lendingTvl = async (block) => {
  const { output: markets } = await sdk.api.abi.call({
    target: Contracts.polygon.lend.ironController,
    abi: abiPolygon.IronController.getAllMarkets,
    chain: 'polygon',
    block,
  });

  const [symbols, cash, underlyingAddress] = await Promise.all([
    sdk.api.abi.multiCall({
      abi: abiPolygon.rToken.symbol,
      calls: markets.map((t) => ({
        target: t,
      })),
      chain: 'polygon',
      block,
    }),

    sdk.api.abi.multiCall({
      abi: abiPolygon.rToken.getCash,
      calls: markets.map((t) => ({
        target: t,
      })),
      chain: 'polygon',
      block,
    }),
    
    sdk.api.abi.multiCall({
      abi: abiPolygon.rToken.underlying,
      calls: markets.map((t) => ({
        target: t,
      })),
      chain: 'polygon',
      block,
    }),
  ]);

  const sum = {};
  symbols.output.forEach((symbol, i) => {
    let underlying
    if (symbol.output === 'rMATIC') {
      underlying = MaticAddress
    } else {
      underlying = underlyingAddress.output[i].output;
    }
    sdk.util.sumSingleBalance(sum, `polygon:${underlying}`, cash.output[i].output);
  });

  return sum;
};

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const tvl = await lendingTvl(chainBlocks['polygon']);

  for (let address of Object.values(Contracts.polygon.pools)) {
    const balances = await poolTvl(address, chainBlocks['ploygon']);

    Object.entries(balances).forEach(([token, value]) => {
      sdk.util.sumSingleBalance(tvl, token, value);
    });
  }

  return tvl;
};

module.exports = {
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([polygonTvl]),
};

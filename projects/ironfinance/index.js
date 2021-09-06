const sdk = require('@defillama/sdk');
const abiPolygon = require('./abi-polygon.json');
const { transformAddress } = require('./utils');

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
  avax: {
    pools: {
      í3usd: '0x952BDA8A83c3D5F398a686bb4e8C6DD90072d523',
    },
  },
  fantom: {
    pools: {
      í3usd: '0x952BDA8A83c3D5F398a686bb4e8C6DD90072d523',
    },
  },
};

const MaticAddress = '0x0000000000000000000000000000000000001010';

const poolTvl = async (chain, poolAddress, block) => {
  const addressTransformer = await transformAddress(chain);
  const [balances, tokens] = await Promise.all([
    sdk.api.abi.call({
      target: poolAddress,
      abi: abiPolygon.IronSwap.getTokenBalances,
      chain: chain,
      block,
    }),
    sdk.api.abi.call({
      target: poolAddress,
      abi: abiPolygon.IronSwap.getTokens,
      chain: chain,
      block,
    }),
  ]);

  const sum = {};
  let i = 0;
  for (const token of tokens.output) {
    if (
      Contracts[chain].ignoredLps &&
      Contracts[chain].ignoredLps.includes(token.toLowerCase())
    ) {
      i++;
      continue;
    }

    const tokenAddress = await addressTransformer(token);
    sdk.util.sumSingleBalance(sum, tokenAddress, balances.output[i]);
    i++;
  }

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
    let underlying;
    if (symbol.output === 'rMATIC') {
      underlying = MaticAddress;
    } else {
      underlying = underlyingAddress.output[i].output;
    }
    sdk.util.sumSingleBalance(
      sum,
      `polygon:${underlying}`,
      cash.output[i].output,
    );
  });

  return sum;
};

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const tvl = await lendingTvl(chainBlocks['polygon']);

  for (let address of Object.values(Contracts.polygon.pools)) {
    const balances = await poolTvl('polygon', address, chainBlocks['polygon']);

    Object.entries(balances).forEach(([token, value]) => {
      sdk.util.sumSingleBalance(tvl, token, value);
    });
  }

  return tvl;
};

const avaxTvl = async (timestamp, ethBlock, chainBlocks) => {
  let tvl = {};
  for (let address of Object.values(Contracts.avax.pools)) {
    const balances = await poolTvl('avax', address, chainBlocks['avax']);

    Object.entries(balances).forEach(([token, value]) => {
      sdk.util.sumSingleBalance(tvl, token, value);
    });
  }

  return tvl;
};

const fantomTvl = async (timestamp, ethBlock, chainBlocks) => {
  let tvl = {};
  for (let address of Object.values(Contracts.avax.pools)) {
    const balances = await poolTvl('fantom', address, chainBlocks['fantom']);

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
  avax: {
    tvl: avaxTvl,
  },
  fantom: {
    tvl: fantomTvl,
  },
  tvl: sdk.util.sumChainTvls([polygonTvl, avaxTvl, fantomTvl]),
};

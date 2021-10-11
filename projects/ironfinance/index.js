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
    wrappedNative: '0x0000000000000000000000000000000000001010',
  },
  avax: {
    pools: {
      is3usd: '0x952BDA8A83c3D5F398a686bb4e8C6DD90072d523',
    },
  },
  fantom: {
    pools: {
      is3usd: '0x952BDA8A83c3D5F398a686bb4e8C6DD90072d523',
    },
    lend: {
      ironController: '0xDc4C597E36Fc80876801df0309Cc11A7C12E0764',
    },
    wrappedNative: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
  },
};

const poolTvl = async (chain, poolAddress, block, addressTransformer) => {
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

  tokens.output.forEach((token, i) => {
    if (
      Contracts[chain].ignoredLps &&
      Contracts[chain].ignoredLps.includes(token.toLowerCase())
    ) {
      return;
    }

    const tokenAddress = addressTransformer(token);
    sdk.util.sumSingleBalance(sum, tokenAddress, balances.output[i]);
  });

  return sum;
};

const lendingTvl = async (chain, block, addressTransformer) => {
  const controller = Contracts[chain].lend.ironController;
  const { output: markets } = await sdk.api.abi.call({
    target: controller,
    abi: abiPolygon.IronController.getAllMarkets,
    chain,
    block,
  });

  const [symbols, cash, underlyingAddress] = await Promise.all([
    sdk.api.abi.multiCall({
      abi: abiPolygon.rToken.symbol,
      calls: markets.map((t) => ({
        target: t,
      })),
      chain,
      block,
    }),

    sdk.api.abi.multiCall({
      abi: abiPolygon.rToken.getCash,
      calls: markets.map((t) => ({
        target: t,
      })),
      chain,
      block,
    }),

    sdk.api.abi.multiCall({
      abi: abiPolygon.rToken.underlying,
      calls: markets.map((t) => ({
        target: t,
      })),
      chain,
      block,
    }),
  ]);

  const sum = {};
  symbols.output.forEach((symbol, i) => {
    let underlying = underlyingAddress.output[i].output;
    if (!underlying) {
      underlying = Contracts[chain].wrappedNative;
    }
    sdk.util.sumSingleBalance(sum, addressTransformer(underlying), cash.output[i].output);
  });

  return sum;
};

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  let block = chainBlocks['polygon'];
  const addressTransformer = await transformAddress('polygon');
  const tvl = await lendingTvl('polygon', block, addressTransformer);

  for (let address of Object.values(Contracts.polygon.pools)) {
    const balances = await poolTvl(
      'polygon',
      address,
      block,
      addressTransformer,
    );

    Object.entries(balances).forEach(([token, value]) => {
      sdk.util.sumSingleBalance(tvl, token, value);
    });
  }

  return tvl;
};

const avaxTvl = async (timestamp, ethBlock, chainBlocks) => {
  let tvl = {};
  const addressTransformer = await transformAddress('avax');
  for (let address of Object.values(Contracts.avax.pools)) {
    const balances = await poolTvl(
      'avax',
      address,
      chainBlocks['avax'],
      addressTransformer,
    );

    Object.entries(balances).forEach(([token, value]) => {
      sdk.util.sumSingleBalance(tvl, token, value);
    });
  }

  return tvl;
};

const fantomTvl = async (timestamp, ethBlock, chainBlocks) => {
  const addressTransformer = await transformAddress('fantom');
  const block = chainBlocks['fantom'];

  let tvl = await lendingTvl('fantom', block, addressTransformer);
  for (let address of Object.values(Contracts.fantom.pools)) {
    const balances = await poolTvl(
      'fantom',
      address,
      block,
      addressTransformer,
    );

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
  avalanche: {
    tvl: avaxTvl,
  },
  fantom: {
    tvl: fantomTvl,
  },
  tvl: sdk.util.sumChainTvls([polygonTvl, avaxTvl, fantomTvl]),
};

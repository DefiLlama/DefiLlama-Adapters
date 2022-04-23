const BigNumber = require('bignumber.js');
const sdk = require('@defillama/sdk');

const TOKEN0_ABI = require('./abis/token0.json');
const TOKEN1_ABI = require('./abis/token1.json');
const FIVE_GET_RESERVES_ABI = require('./abis/fiveGetReserves.json');
const SIZE_GET_RESERVES_ABI = require('./abis/sizeGetReserves.json');

const FIVE_START_BLOCK = 12108732;
const FIVE_FACTORY = '0x673662e97b05e001816c380ba5a628d2e29f55d1';
const SIZE_START_BLOCK = 14422957;
const SIZE_FACTORY = '0xC480b33eE5229DE3FbDFAD1D2DCD3F3BAD0C56c6';

const Product = {
  five: 'five',
  size: 'size',
}

module.exports = async function tvl(_, block, product) {
  const pairs = await getPairs(block, product);
  const reserves = await getReserves(block, pairs, product);
  const balances = getBalances(pairs, reserves);

  return balances;
}

async function getPairAddresses(block, product) {
  const logs = await sdk.api.util.getLogs({
    keys: [],
    toBlock: block,
    target: product == Product.five ? FIVE_FACTORY : SIZE_FACTORY,
    fromBlock: product == Product.five ? FIVE_START_BLOCK : SIZE_START_BLOCK,
    topic: 'PairCreated(address,address,address,uint256)',
  });

  return logs.output
    .map(log => typeof log === 'string' ? log : `0x${log.data.slice(64 - 40 + 2, 64 + 2)}`)
    .map(pairAddress => pairAddress.toLowerCase());
}

async function getPairs(block, product) {
  const pairAddresses = await getPairAddresses(block, product);
  const [token0Addresses, token1Addresses] = await getTokenAddresses(block, pairAddresses);
  const pairs = constructPairs(token0Addresses, token1Addresses);

  return pairs;
}

async function getTokenAddresses(block, pairAddresses) {
  const [token0Addresses, token1Addresses] = await Promise.all([
    sdk.api.abi.multiCall({
      abi: TOKEN0_ABI,
      calls: pairAddresses.map(pairAddress => ({
        target: pairAddress,
      })),
      block,
    }),
    sdk.api.abi.multiCall({
      abi: TOKEN1_ABI,
      calls: pairAddresses.map(pairAddress => ({
        target: pairAddress,
      })),
      block,
    }),
  ]);

  return [token0Addresses.output, token1Addresses.output];
}

async function constructPairs(token0Addresses, token1Addresses) {
  const pairs = {};

  token0Addresses.forEach((token0Address) => {
      const tokenAddress = token0Address.output.toLowerCase();
        const pairAddress = token0Address.input.target.toLowerCase();
        pairs[pairAddress] = {
          token0Address: tokenAddress,
        }
  });

  token1Addresses.forEach((token1Address) => {
      const tokenAddress = token1Address.output.toLowerCase();
        const pairAddress = token1Address.input.target.toLowerCase();
        pairs[pairAddress] = {
          ...(pairs[pairAddress] || {}),
          token1Address: tokenAddress,
        }
  });

  return pairs;
}

async function getReserves(block, pairs, product) {
  const reserves = await sdk.api.abi.multiCall({
    abi: product == Product.five ? FIVE_GET_RESERVES_ABI : SIZE_GET_RESERVES_ABI,
    calls: Object.keys(pairs).map((pairAddress) => ({
      target: pairAddress,
    })),
    block,
  });

  return reserves.output;
}

async function getBalances(pairs, reserves) {
  return reserves.reduce((memo, reserve) => {
      const pairAddress = reserve.input.target.toLowerCase();
      const pair = pairs[pairAddress] || {};

      if (pair.token0Address) {
        const reserve0 = new BigNumber(reserve.output['0']);
        if (!reserve0.isZero()) {
          const existingBalance = new BigNumber(memo[pair.token0Address] || '0');
          memo[pair.token0Address] = existingBalance.plus(reserve0).toFixed()
        }
      }

      if (pair.token1Address) {
        const reserve1 = new BigNumber(reserve.output['1']);
        if (!reserve1.isZero()) {
          const existingBalance = new BigNumber(memo[pair.token1Address] || '0');
          memo[pair.token1Address] = existingBalance.plus(reserve1).toFixed()
        }
      }

    return memo
  }, {});
}

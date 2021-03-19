const _ = require('underscore');
const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const getReserves = require('./abis/uniswap/getReserves.json');
const token0 = require('./abis/uniswap/token0.json');
const token1 = require('./abis/uniswap/token1.json');
const numTokensWrapped = require('./abis/erc95/numTokensWrapped.json');
const getTokenInfo = require('./abis/erc95/getTokenInfo.json');

const zero = new BigNumber(0);

const configs = {
  pairAddresses: [
    '0x32Ce7e48debdccbFE0CD037Cc89526E4382cb81b', // CORE/WETH
    '0x6fad7D44640c5cd0120DEeC0301e8cf850BecB68', // CORE/cBTC
    '0x01AC08E821185b6d87E68c67F9dc79A8988688EB', // coreDAI/wCORE
  ],
  erc95TokenAddresses: [
    '0x7b5982dcAB054C377517759d0D2a3a5D02615AB8', // cBTC
    '0x00a66189143279b6DB9b77294688F47959F37642', // coreDAI,
    '0x17B8c1A92B66b1CF3092C5d223Cb3a129023b669', // wCORE
  ],
}

/**
 * Retrieve all the Uniswap pair information.
 * 
 * @param {[String]} pairAddresses The uniswap pair addresses
 * @param {any} timestamp 
 * @param {any} block 
 * @returns {Promise<[{ token0: String,  token1: String, reserve0: String, reserve1: String }]>}
 */
async function getUniswapPairInfo(pairAddresses, timestamp, block) {
  const [token0Addresses, token1Addresses, reserves, totalSupplies] = await Promise.all([
    sdk.api.abi.multiCall({
      abi: token0,
      calls: pairAddresses.map((pairAddress) => ({
        target: pairAddress,
      })),
      block,
    })
      .then(({ output }) => output.map(value => value.output)),
    sdk.api.abi.multiCall({
      abi: token1,
      calls: _.map(pairAddresses, (pairAddress) => ({
        target: pairAddress,
      })),
      block,
    })
      .then(({ output }) => output.map(value => value.output)),
    sdk.api.abi.multiCall({
      abi: getReserves,
      calls: _.map(pairAddresses, (pairAddress) => ({
        target: pairAddress,
      })),
      block,
    })
      .then(({ output }) => output.map(value => value.output)),
    sdk.api.abi.multiCall({
      block,
      calls: _.map(pairAddresses, pairAddress => ({
        target: pairAddress
      })),
      abi: 'erc20:totalSupply',
    }).then(({ output }) => output.map(value => value.output))
  ]);
  return pairAddresses.map((_value, index) => {
    return {
      reserve0: reserves[index] ? reserves[index]['reserve0'] : null,
      reserve1: reserves[index] ? reserves[index]['reserve1'] : null,
      token0: token0Addresses[index],
      token1: token1Addresses[index],
      totalSupply: totalSupplies[index],
    }
  })
}

/**
 * Retrieve the underlying reserve of each token within a pair.
 * 
 * @param {{ token0: String, token1: String, reserve0: String, reserve1: String }} pairInfo Contains the information about a pair.
 * @param {any} timestamp 
 * @param {any} block
 * @returns {Promise<{ [String]: BigNumber }>}
 */
async function getPairUnderlyingReserves(pairInfo, timestamp, block) {
  return Promise.all([
    getTokenUnderlyingReserves(pairInfo.token0, pairInfo.reserve0, timestamp, block),
    getTokenUnderlyingReserves(pairInfo.token1, pairInfo.reserve1, timestamp, block)
  ]);
};

/**
 * Retrieve the token reserve and if it's an ERC95 token, retrieve
 * each underlying assets reserves.
 * 
 * @param {String} token Token address
 * @param {String} defaultReserve Default reserve amount to use when not a ERC95 token
 * @param {any} timestamp 
 * @param {any} block
 * @returns {Promise<{ [String]: BigNumber }>}
 */
async function getTokenUnderlyingReserves(token, defaultReserve, _timestamp, block) {
  if (configs.erc95TokenAddresses.indexOf(token) === -1) {
    return [{ [token]: defaultReserve }];
  }

  const numTokensWrappedResponse = await sdk.api.abi.call({
    target: token,
    abi: numTokensWrapped,
    block
  });

  const wrappedTokenCount = parseInt(numTokensWrappedResponse.output);
  const getTokenInfoCalls = _.range(wrappedTokenCount).map(i => ({
    target: token,
    params: [i],
    abi: getTokenInfo,
    block
  }));

  const tokenInfoResponse = await sdk.api.abi.multiCall({
    block,
    calls: getTokenInfoCalls,
    abi: getTokenInfo,
  });

  const reserves = tokenInfoResponse.output.map(info => ({
    [info.output.address]: info.output.reserve
  }));

  return reserves;
};

/**
 * Flatten and merge common underlying assets with their reserve sum.
 *
 * @param {[{[String]: BigNumber}]} underlyingReserves 
 * @returns {{[String]: [String]}} An object of the token address and its reserve.
 */
function flattenUnderlyingReserves(underlyingReserves) {
  const reserves = {};

  _.each(underlyingReserves, pairReserves => {
    _.each(pairReserves, tokenReserves => {
      _.each(tokenReserves, underlyingReserves => {
        _.each(Object.keys(underlyingReserves), address => {
          const tokenReserve = new BigNumber(underlyingReserves[address]);
          reserves[address] = (reserves[address] || zero).plus(tokenReserve);
        });
      });
    });
  });

  _.each(Object.keys(reserves), address => {
    reserves[address] = reserves[address].toFixed();
  });

  return reserves;
}

async function tvl(timestamp, block) {
  const pairInfo = await getUniswapPairInfo(configs.pairAddresses, timestamp, block);
  const underlyingReserves = await Promise.all(pairInfo.map(info => getPairUnderlyingReserves(info, timestamp, block)));
  const balances = flattenUnderlyingReserves(underlyingReserves);

  return balances;
}

module.exports = {
  name: 'cvault.finance',
  token: 'CORE',
  category: 'assets',
  start: 1601142406,    // 2020-09-26 17:46:46 (UTC)
  tvl
};

/*==================================================
  Modules
  ==================================================*/

const BigNumber = require('bignumber.js');

const abi = require('./abi');
const utils = require('./utils');
const sdk = require('@defillama/sdk');

/*==================================================
  Settings
  ==================================================*/

const DISPATCHER = "0xC3DC853dD716bd5754f421ef94fdCbac3902ab32";
const START_BLOCK = 11639906;

/*==================================================
  TVL
  ==================================================*/

module.exports = async function tvl(timestamp, block) {

  const supportedTokens = await (
    sdk
      .api
      .util
      .tokenList()
      .then((supportedTokens) => supportedTokens.map(({ contract }) => contract))
  );

  /* pull melon fund holding addresses */
  const logs = (await sdk.api.util
    .getLogs({
      keys: [],
      toBlock: block,
      target: DISPATCHER,
      fromBlock: START_BLOCK,
      topic: 'VaultProxyDeployed(address,address,address,address,address,string)',
    })).output;

  const vaultProxies = (
    logs
      .map((log) =>         // sometimes the full log is emitted
        typeof log === 'string' ? log.toLowerCase() : `0x${log.data.slice(64 - 40 + 2, 64 + 2)}`.toLowerCase()
      )
  );

  const holdingTokensResults = (await sdk.api.abi
    .multiCall({
      block,
      calls: vaultProxies.map(vaultProxy => ({ target: vaultProxy })),
      abi: abi['getTrackedAssets'],
    })).output;

  /* supported tokens */
  const balanceOfCalls = holdingTokensResults
    .filter(result => result.success)
    .map(result => (
      result.output
      .filter(token => supportedTokens.includes(token.toLowerCase()))
      .map(token => ({ target: token, params: result.input.target }))
    ))
    .reduce((a, b) => a.concat(b), []);

  const balanceOfResult = await sdk.api.abi.multiCall({
    block,
    calls: balanceOfCalls,
    abi: 'erc20:balanceOf',
  });

  /* combine token volumes on multiple funds */
  const balances = {};

  balanceOfResult.output.forEach(result => {
    const balance = new BigNumber(result.output || 0);
    if (balance <= 0) return;

    const asset = result.input.target.toLowerCase();
    const total = balances[asset];

    if (total) {
      balances[asset] = balance.plus(total).toFixed();
    } else {
      balances[asset] = balance.toFixed();
    }
  });

  /* Uniswap liquidity tokens */

  const unsupportedTokens = holdingTokensResults
    .filter(result => result.success)
    .map(result => (
      result.output
      .filter(token => !supportedTokens.includes(token.toLowerCase()))
    ))
    .reduce((a, b) => a.concat(b), []);

  const [token0Addresses, token1Addresses] = await Promise.all([
    sdk.api.abi
      .multiCall({
        abi: abi['token0'],
        calls: unsupportedTokens.map((pairAddress) => ({
          target: pairAddress,
        })),
        block,
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: abi['token1'],
        calls: unsupportedTokens.map((pairAddress) => ({
          target: pairAddress,
        })),
        block,
      })
      .then(({ output }) => output),
  ]);

  const pairs = {};

  // add token0Addresses
  token0Addresses.forEach((token0Address) => {
    if (token0Address.success) {
      const tokenAddress = token0Address.output.toLowerCase();

      if (supportedTokens.includes(tokenAddress)) {
        const pairAddress = token0Address.input.target.toLowerCase();
        pairs[pairAddress] = {
          token0Address: tokenAddress,
        }
      }
    }
  });

  // add token1Addresses
  token1Addresses.forEach((token1Address) => {
    if (token1Address.success) {
      const tokenAddress = token1Address.output.toLowerCase();
      if (supportedTokens.includes(tokenAddress)) {
        const pairAddress = token1Address.input.target.toLowerCase();
        pairs[pairAddress] = {
          ...(pairs[pairAddress] || {}),
          token1Address: tokenAddress,
        }
      }
    }
  });

  // add totalSupply
  const totalSupplyValues = (await sdk.api.abi
    .multiCall({
      block,
      calls: Object.keys(pairs).map((pairAddress) => ({
        target: pairAddress,
      })),
      abi: abi['totalSupply'],
    })).output;

  totalSupplyValues.forEach((totalSupply) => {
    if (totalSupply.success) {
      const pairAddress = totalSupply.input.target.toLowerCase();
      pairs[pairAddress].totalSupply = new BigNumber(totalSupply.output || 0);
    }
  });

  // add liquidity
  const uniswapBalanceOfCalls = holdingTokensResults
    .filter(result => result.success)
    .map(result => (
      result.output
      .filter(token => Object.keys(pairs).includes(token.toLowerCase()))
      .map(token => ({ target: token, params: result.input.target }))
    ))
    .reduce((a, b) => a.concat(b), []);

  const uniswapBalanceOfResult = await sdk.api.abi.multiCall({
    block,
    calls: uniswapBalanceOfCalls,
    abi: 'erc20:balanceOf',
  });

  uniswapBalanceOfResult.output.forEach(result => {
    const balance = new BigNumber(result.output || 0);

    if (balance < 0) return;

    const asset = result.input.target.toLowerCase();
    const total = pairs[asset].liquidity;

    if (total) {
      pairs[asset].liquidity = balance.plus(total);
    } else {
      pairs[asset].liquidity = balance;
    }
  });

  // calculate uniswap underlying tokens' balances
  const reserves = (await sdk.api.abi
    .multiCall({
      abi: abi['getReserves'],
      calls: Object.keys(pairs).map((pairAddress) => ({
        target: pairAddress,
      })),
      block,
    })).output;

  const uniswapBalances = reserves.reduce((accumulator, reserve, i) => {
    if (reserve.success) {
      const pairAddress = reserve.input.target.toLowerCase();
      const pair = pairs[pairAddress] || {};

      // handle reserve0
      if (pair.token0Address) {
        const reserve0 = new BigNumber(reserve.output['0']);
        if (!reserve0.isZero()) {
          const existingBalance = new BigNumber(
            accumulator[pair.token0Address] || '0'
          );

          const token0Amount = pair.liquidity.times(reserve0).div(pair.totalSupply);

          accumulator[pair.token0Address] = existingBalance
            .plus(token0Amount)
            .integerValue()
            .toFixed()
        }
      }

      // handle reserve1
      if (pair.token1Address) {
        const reserve1 = new BigNumber(reserve.output['1']);

        if (!reserve1.isZero()) {
          const existingBalance = new BigNumber(
            accumulator[pair.token1Address] || '0'
          );

          const token1Amount = pair.liquidity.times(reserve1).div(pair.totalSupply);

          accumulator[pair.token1Address] = existingBalance
            .plus(token1Amount)
            .integerValue()
            .toFixed()
        }
      }
    }

    return accumulator
  }, {})

  return utils.mergeBalances(balances, uniswapBalances);
}

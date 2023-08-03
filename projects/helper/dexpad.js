const ADDRESSES = require('./coreAssets.json')
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");

const { unwrapUniswapLPs } = require("./unwrapLPs");
const getPairFactory = 'function getPair(address, address) view returns (address)'

const { isLP } = require("./utils");
const { getChainTransform, getFixBalances } = require("./portedTokens");

async function getDexPadLpsCoreValue(
  block,
  chain,
  contract, // locker contract address.
  getNumLockedTokensABI, // ABI to retrieve the total amount of tokens locked.
  getLockedTokenAtIndexABI, // ABI to retrieve tokens at a specific lock index.
  trackedTokens = [], // liquid assets for tokens to be paired against (ETH, USD etc.).
  pool2 = [], // pool2 pair to be excluded from the balances.
  isMixedTokenContract = false,
  factory = null
) {
  let balances = {};

  const getLocks = Number(
    (await sdk.api.abi.call({
      abi: getNumLockedTokensABI,
      target: contract,
      chain: chain,
      block: block
    })).output
  );

  let lockedLPs = [];
  const lockIds = Array.from(Array(getLocks).keys());
  {
    const lps = (await sdk.api.abi.multiCall({
      abi: getLockedTokenAtIndexABI,
      calls: lockIds.map(lockid => ({
        target: contract,
        params: lockid
      })),
      chain: chain,
      block: block
    })).output;

    lps.forEach(lp => {
      if (lp.success && !pool2.includes(lp)) {
        const lpToken = lp.output.toLowerCase();
        lockedLPs.push(lpToken);
      }
    });
  }

  return isMixedTokenContract // check if purely an lp locker or contains lps and tokens
    ? getTokensAndLPsTrackedValue(
        balances,
        lockedLPs,
        contract,
        factory,
        trackedTokens,
        block,
        chain
      )
    : getLPsTrackedValue(
        balances,
        lockedLPs,
        contract,
        factory,
        trackedTokens,
        block,
        chain
      );
}

// get pairs made of 2 core assets to avoid double counting their balances
async function generateWhitelistedPairs(trackedTokens, factory, block, chain) {
  
  if (!Array.isArray(trackedTokens))
    throw new Error("must pass an array of base tokens to trackedTokens");

  let matchedBaseTokens = [];
  if (trackedTokens.length > 1) {
    trackedTokens.forEach(token0 =>
      trackedTokens.forEach(token1 => {
        if (!(token0 == token1)) matchedBaseTokens.push([token0, token1]);
      })
    );
  }

  let whitelistedBasePairs = new Set();

  {
    const basePairs = (await sdk.api.abi.multiCall({
      abi: getPairFactory,
      calls: Object.values(matchedBaseTokens).map(value => ({
        target: factory,
        params: value
      })),
      chain: chain,
      block: block
    })).output;

    basePairs.forEach(pair => {
      if (pair.success) {
        const basePair = pair.output.toLowerCase();
        if (basePair != ADDRESSES.null)
          whitelistedBasePairs.add(basePair);
      }
    });
  }
  return whitelistedBasePairs;
}
// mixed token contracts
async function getTokensAndLPsTrackedValue(
  balances,
  tokens,
  contract,
  factory,
  trackedTokens,
  block,
  chain
) {
  const whitelistedBasePairs = await generateWhitelistedPairs(
    trackedTokens,
    factory,
    block,
    chain
  );

  const [tokenSymbols, tokenBalances] = await Promise.all([
    sdk.api.abi
      .multiCall({
        abi: 'string:symbol',
        chain,
        calls: tokens.map(token => ({
          target: token
        })),
        block
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: "erc20:balanceOf",
        chain,
        calls: tokens.map(token => ({
          target: token,
          params: contract
        })),
        block
      })
      .then(({ output }) => output)
  ]);
  let lps = {};
  let filteredLps = {};

  tokenBalances.forEach(balance => {
    const lpAddress = balance.input.target.toLowerCase();
    lps[lpAddress] = {
      balance: balance.output
    };
  });

  tokenSymbols.forEach(tokenSymbol => {
    const pairAddress = tokenSymbol.input.target.toLowerCase();
    lps[pairAddress].symbol = tokenSymbol.output;
  });

  Object.entries(lps).forEach(([key, value]) => {
    if (value.symbol && value.balance) {
      if (value.balance > 0 && isLP(value.symbol, key, chain)) {
        let lpBalance = whitelistedBasePairs.has(key)
          ? value.balance
          : BigNumber(value.balance).times(BigNumber(2)).toFixed(0);
        filteredLps[key] = lpBalance;
      }
    }
  });

  let lpBalances = [];
  Object.entries(filteredLps).forEach(([key, value]) => {
    lpBalances.push({
      balance: value,
      token: key
    });
  });
  const chainTransform = await getChainTransform(chain)

  await unwrapUniswapLPs(
    balances,
    lpBalances,
    block,
    chain,
    addr => chainTransform(addr)
  );

  let formattedWhitelist = trackedTokens.map(address => `${chain}:${address}`);

  balances = Object.keys(balances)
    .filter(balance => formattedWhitelist.includes(balance))
    .reduce((obj, balance) => {
      obj[balance] = balances[balance];
      return obj;
    }, {});

  return balances;
}

// pure lp contracts
async function getLPsTrackedValue(
  balances,
  lpTokens,
  contract,
  factory,
  trackedTokens,
  block,
  chain
) {
  if (!Array.isArray(trackedTokens))
    throw new Error("must pass an array of base tokens to trackedTokens");
  const whitelistedBasePairs = await generateWhitelistedPairs(
    trackedTokens,
    factory,
    block,
    chain
  );

  let lps = [];
  {
    const tokenBalances = (await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: lpTokens.map(lpToken => ({
        target: lpToken,
        params: contract
      })),
      chain: chain,
      block: block
    })).output;
    tokenBalances.forEach(balance => {
      if (balance.success) {
        const lpAddress = balance.input.target.toLowerCase();
        let lpBalance = whitelistedBasePairs.has(lpAddress)
          ? balance.output
          : BigNumber(balance.output).times(BigNumber(2)).toFixed(0);
        if (lpBalance > 0) {
          lps[lpAddress] = lpBalance;
        }
      }
    });
  }

  let lpBalances = [];
  Object.entries(lps).forEach(([key, value]) => {
    lpBalances.push({
      balance: value,
      token: key
    });
  });
  await unwrapUniswapLPs(
    balances,
    lpBalances,
    block,
    chain,
    addr => `${chain}:${addr}`
  );
  let formattedWhitelist = trackedTokens.map(addr => `${chain}:${addr}`);

  // console.log("before", balances)
  balances = Object.keys(balances)
    .filter(balance => formattedWhitelist.includes(balance))
    .reduce((obj, balance) => {
      obj[balance] = balances[balance];
      return obj;
    }, {});
    // console.log("after",balances)
    if(chain === 'kava'){
      return (await getFixBalances(chain))(balances)
    }
  return balances;
}


module.exports = {
  getDexPadLpsCoreValue,
  getTokensAndLPsTrackedValue,
  getLPsTrackedValue
};

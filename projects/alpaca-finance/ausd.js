const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { getConfig } = require('../helper/cache')

async function getProcolAUSDAddresses(chain) {
  if (chain == "bsc") {
    return (
      await getConfig('alpaca-finance/ausd-bsc',
        "https://raw.githubusercontent.com/alpaca-finance/alpaca-stablecoin/main/.mainnet.json"
      )
    );
  }
}

async function getProcolLYFAddresses(chain) {
  if (chain == "bsc") {
    return (
      await getConfig('alpaca-finance/lyf-bsc',
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.mainnet.json"
      )
    );
  }
  if (chain == "fantom") {
    return (
      await getConfig('alpaca-finance/lyf-fantom',
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.fantom_mainnet.json"
      )
    );
  }
}

async function calAusdTvl(chain, block) {
  /// @dev Initialized variables
  const balances = {};

  const ausdAddresses = await getProcolAUSDAddresses(chain);
  const lyfAddresses = await getProcolLYFAddresses(chain);

  const pids = await sdk.api.abi.multiCall({
    block,
    abi: abi.pid,
    calls: ausdAddresses["IbTokenAdapters"].map((each) => {
      return {
        target: each.address,
      };
    }),
    chain,
  });
  const failaunchUserInfos = await sdk.api.abi.multiCall({
    block,
    abi: abi.userInfo,
    calls: pids.output.map((each) => {
      return {
        target: lyfAddresses["FairLaunch"].address,
        params: [each.output, each.input.target],
      };
    }),
    chain,
  });
  const totalTokens = await sdk.api.abi.multiCall({
    block,
    abi: abi.totalToken,
    calls: ausdAddresses["IbTokenAdapters"].map((each) => {
      return {
        target: each.collateralToken,
      };
    }),
    chain,
  });
  const totalSupplys = await sdk.api.abi.multiCall({
    block,
    abi: abi.totalSupply,
    calls: ausdAddresses["IbTokenAdapters"].map((each) => {
      return {
        target: each.collateralToken,
      };
    }),
    chain,
  });
  const vaultTokens = await sdk.api.abi.multiCall({
    block,
    abi: abi.token,
    calls: ausdAddresses["IbTokenAdapters"].map((each) => {
      return {
        target: each.collateralToken,
      };
    }),
    chain,
  });
  
  failaunchUserInfos.output.forEach((eachUserInfo, i) => {
    const balance = new BigNumber(eachUserInfo.output.amount).multipliedBy(totalTokens.output[i].output).dividedBy(totalSupplys.output[i].output)
    balances[`${chain}:${vaultTokens.output[i].output}`] = balance.toFixed(0);
  })
  return balances;
}

module.exports = {
  calAusdTvl,
};

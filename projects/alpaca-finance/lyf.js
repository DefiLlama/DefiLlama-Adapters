const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { getConfig } = require('../helper/cache')
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

async function getProcolAddresses(chain) {
  if (chain == 'bsc') {
    return (
      await getConfig('alpaca-finance/lyf-bsc',
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.mainnet.json"
      )
    )
  }
  if (chain == 'fantom') {
    return (
      await getConfig('alpaca-finance/lyf-fantom',
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.fantom_mainnet.json"
      )
    )
  }
}

async function calLyfTvl(chain, block) {
  /// @dev Initialized variables
  const balances = {};

  /// @dev Getting all addresses from Github
  const addresses = await getProcolAddresses(chain);

  for (let i = 0; i < addresses["Vaults"].length; i++) {
    /// @dev getting balances that each of workers holding
    const stakingTokenInfos = (
      await sdk.api.abi.multiCall({
        block,
        abi: abi.userInfo,
        calls: addresses["Vaults"][i]["workers"].filter((n) => {
          /// @dev filter only workers that are working with LPs
          if (n.name.includes("CakeMaxiWorker")) {
            return false;
          }
          return true;
        }).map((worker) => {
          return {
            target: worker["stakingTokenAt"],
            params: [worker["pId"], worker["address"]],
          };
        }),
        chain,
      })
    ).output;

    /// @dev unwrap LP to get underlaying token balances for workers that are working with LPs
    await unwrapUniswapLPs(
      balances,
      stakingTokenInfos
        .filter((n) => {
          /// @dev filter only workers that are working with LPs
          const name = addresses["Vaults"][i]["workers"].find(
            (w) => w.address === n.input.params[1]
          ).name;
          if (name.includes("CakeMaxiWorker")) {
            return false;
          }
          return true;
        })
        .map((info) => {
          /// @dev getting LP address and return the object that unwrapUniswapLPs want
          const lpAddr = addresses["Vaults"][i]["workers"].find(
            (w) => w.address === info.input.params[1]
          ).stakingToken;
          return {
            token: lpAddr,
            balance: info.output.amount,
          };
        }),
      block,
      chain,
      (addr) => `${chain}:${addr}`
    );

    /// @dev update balances directly for single-asset workers
    const singleAssetWorkersInfos = (
      await sdk.api.abi.multiCall({
        block,
        abi: abi.userInfoCake,
        calls: addresses["Vaults"][i]["workers"].filter((n) => {
          /// @dev filter only single-asset LYF workers
          return n.name.includes("CakeMaxiWorker");
        }).map((worker) => {
          return {
            target: worker["stakingTokenAt"],
            params: [worker["address"]],
          };
        }),
        chain,
      })
    ).output;

    const singleAssetPrice = (
      await sdk.api.abi.multiCall({
        block,
        abi: abi.singleAssetPrice,
        calls: addresses["Vaults"][0]["workers"].filter((n) => {
          /// @dev filter only single-asset LYF workers
          return n.name.includes("CakeMaxiWorker");
        }).map((worker) => {
          return {
            target: worker["stakingTokenAt"],
          };
        }),
        chain,
      })
    ).output;

    const singleAssetWorkersBalances = singleAssetWorkersInfos
      .map((n) => {
        /// @dev getting staking token address and return the object to be sum with balances
        const stakingTokenAddr = addresses["Vaults"][i]["workers"].find(
          (w) => w.address === n.input.params[0]
        ).stakingToken;
        return {
          token: stakingTokenAddr,
          balance: BigNumber(n.output.shares).multipliedBy(BigNumber(singleAssetPrice[0].output)).div(1e18),
        };
      });

    /// @dev sum single-asset balances to balances variable
    singleAssetWorkersBalances.forEach((s) => {
      balances[`${chain}:${s.token}`] = BigNumber(
        balances[`${chain}:${s.token}`] || 0
      )
        .plus(BigNumber(s.balance))
        .toFixed(0);
    });
  }

  return balances;
}

module.exports = {
  calLyfTvl,
  getProcolAddresses
}
  
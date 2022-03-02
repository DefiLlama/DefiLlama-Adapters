const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const axios = require("axios");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

async function getProcolAddresses(chain) {
  if (chain == 'bsc') {
    return (
      await axios.get(
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.mainnet.json"
      )
    ).data;
  }
  if (chain == 'fantom') {
    return (
      await axios.get(
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.fantom_mainnet.json"
      )
    ).data;
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
        calls: addresses["Vaults"][i]["workers"].map((worker) => {
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
    const singleAssetWorkersBalances = stakingTokenInfos
      .filter((n) => {
        /// @dev filter only single-asset LYF workers
        const name = addresses["Vaults"][i]["workers"].find(
          (w) => w.address === n.input.params[1]
        ).name;
        if (name.includes("CakeMaxiWorker")) {
          return true;
        }
        return false;
      })
      .map((n) => {
        /// @dev getting staking token address and return the object to be sum with balances
        const stakingTokenAddr = addresses["Vaults"][i]["workers"].find(
          (w) => w.address === n.input.params[1]
        ).stakingToken;
        return {
          token: stakingTokenAddr,
          balance: n.output.amount,
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

  /// @dev getting all unused liquidity on each vault
  const unusedBTOKEN = (
    await sdk.api.abi.multiCall({
      block,
      abi: abi.balanceOf,
      calls: addresses["Vaults"].map((v) => {
        return {
          target: v["baseToken"],
          params: [v["address"]],
        };
      }),
      chain,
    })
  ).output;

  unusedBTOKEN.forEach((u) => {
    balances[`${chain}:${u.input.target.toLowerCase()}`] = BigNumber(
      balances[`${chain}:${u.input.target.toLowerCase()}`] || 0
    )
      .plus(BigNumber(u.output))
      .toFixed(0);
  });

  return balances;
}

module.exports = {
  calLyfTvl
}
  
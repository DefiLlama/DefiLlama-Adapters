const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const axios = require("axios");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

async function getProcolAddresses() {
  return (
    await axios.get(
      "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.mainnet.json"
    )
  ).data;
}

async function getProcolAUSDAddresses() {
  return (
    await axios.get(
      "https://raw.githubusercontent.com/alpaca-finance/alpaca-stablecoin/main/.mainnet.json"
    )
  ).data;
}

async function getProcolXAlpacaAddresses() {
  return (
    await axios.get(
      "https://raw.githubusercontent.com/alpaca-finance/xALPACA-contract/main/.mainnet.json"
    )
  ).data;
}

function getBSCAddress(address) {
  return `bsc:${address}`;
}

async function tvl(timestamp, ethBlock, chainBlocks) {
  /// @dev Initialized variables
  const balances = {};

  /// @dev Getting all addresses from Github
  const addresses = await getProcolAddresses();
  const ausdAddresses = await getProcolAUSDAddresses();

  const block = chainBlocks.bsc;

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
        chain: "bsc",
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
      "bsc",
      (addr) => `bsc:${addr}`
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
      balances[getBSCAddress(s.token)] = BigNumber(
        balances[getBSCAddress(s.token)] || 0
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
      chain: "bsc",
    })
  ).output;

  unusedBTOKEN.forEach((u) => {
    balances[getBSCAddress(u.input.target)] = BigNumber(
      balances[getBSCAddress(u.input.target)] || 0
    )
      .plus(BigNumber(u.output))
      .toFixed(0);
  });

  /// @dev getting total supply ausd
  const ausdTVL = (
    await sdk.api.abi.multiCall({
      block,
      abi: abi.ausdTotalStablecoinIssued,
      calls: [
        {
          target: ausdAddresses["BookKeeper"].address,
        },
      ],
      chain: "bsc",
    })
  ).output;
  const base = new BigNumber(10);
  const balanceAUSDTVL = new BigNumber(ausdTVL[0].output).dividedBy(
    base.exponentiatedBy(27)
  );
  const ausdAddress = ausdAddresses["AlpacaStablecoin"]["AUSD"].address;
  balances[getBSCAddress(ausdAddress)] = balanceAUSDTVL.toFixed(0);

  return balances;
}
async function staking(timestamp, block, chainBlocks) {
  const xalpacaAddresses = await getProcolXAlpacaAddresses();

  const xalpacaTVL = (
    await sdk.api.abi.multiCall({
      block: chainBlocks.bsc,
      abi: abi.xalpacaTotalSupply,
      calls: [
        {
          target: xalpacaAddresses["xALPACA"],
        },
      ],
      chain: "bsc",
    })
  ).output;
  const alpacaAddress = xalpacaAddresses["Tokens"]["ALPACA"];
  return { [getBSCAddress(alpacaAddress)]: xalpacaTVL[0].output };
}
// node test.js projects/alpaca-finance/index.js
module.exports = {
  name: "Alpaca Finance",
  token: "ALPACA",
  category: "lending",
  start: 1602054167,
  bsc: {
    tvl,
    staking,
  },
};

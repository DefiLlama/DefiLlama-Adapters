const { getConfig } = require("../helper/cache");
const abi = require("./abi.json");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

async function getProtocolAddresses(chain) {
  if (chain == "bsc") {
    return await getConfig(
      "alpaca-finance/lyf-bsc",
      "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.mainnet.json"
    );
  }
  if (chain == "fantom") {
    return await getConfig(
      "alpaca-finance/lyf-fantom",
      "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.fantom_mainnet.json"
    );
  }
}

async function calLendingTvl(chain, block) {
  /// @dev Initialized variables
  const balances = {};

  /// @dev Getting all addresses from Github
  const addresses = await getProtocolAddresses(chain);

  const vaultsUnutilizedBalance = (
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

  for (let i = 0; i < addresses["Vaults"].length; i++) {
    const vault = addresses["Vaults"][i];

    await sdk.util.sumSingleBalance(
      balances,
      vault.baseToken,
      vaultsUnutilizedBalance[i].output,
      chain
    );
  }

  return balances;
}

async function calBorrowingTvl(chain, block) {
  /// @dev Initialized variables
  const balances = {};

  /// @dev Getting all addresses from Github
  const addresses = await getProtocolAddresses(chain);

  const vaultsDebtVal = (
    await sdk.api.abi.multiCall({
      block,
      abi: abi.vaultDebtVal,
      calls: addresses["Vaults"].map((v) => {
        return { target: v.address };
      }),
      chain,
    })
  ).output;

  const vaultsPendingInterest = await pendingInterest(addresses, block, chain);

  for (let i = 0; i < addresses["Vaults"].length; i++) {
    const vault = addresses["Vaults"][i];

    const vaultPendingInterest = new BigNumber(vaultsPendingInterest[i].output);
    const vaultDebtValue = new BigNumber(vaultsDebtVal[i].output).plus(
      vaultPendingInterest
    );

    await sdk.util.sumSingleBalance(
      balances,
      vault.baseToken,
      vaultDebtValue.toFixed(0),
      chain
    );
  }
  return balances;
}

async function pendingInterest(addresses, block, chain) {
  return (
    await sdk.api.abi.multiCall({
      block,
      abi: abi.pendingInterest,
      calls: addresses["Vaults"].map((v) => {
        return { target: v.address, params: [0] };
      }),
      chain,
    })
  ).output;
}

module.exports = {
  calLendingTvl,
  calBorrowingTvl,
};

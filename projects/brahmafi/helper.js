const sdk = require("@defillama/sdk");
const vaultAbi = require("./vault.json");
const batcherAbi = require("./batcher.json");
const teAbi = require("./tradeExecutor.json");

const vaults = [
  {
    address: "0xAa0508FcD0352B206F558b2B817dcC1F0cc3F401",
    batcher: "0x47c84A87A2a972769cc5DeDa28118617E3A48F8C",
  },
  {
    address: "0x1C4ceb52ab54a35F9d03FcC156a7c57F965e081e",
    batcher: "0x1b6BF7Ab4163f9a7C1D4eCB36299525048083B5e",
  },
  {
    address: "0x3c4Fe0db16c9b521480c43856ba3196A9fa50E08",
    batcher: "0xa67feFA6657e9aa3e4ee6EF28531641dAFBB8cAf",
  },
];

const getTVLData = async (block) => {
  const vaultCalls = vaults.map((v) => ({ target: v.address }));
  const batcherCalls = vaults.map((v) => ({ target: v.batcher }));

  const [totalSupplies, pendingDeposits, tokens] = await Promise.all([
    sdk.api.abi.multiCall({
      block,
      calls: vaultCalls,
      abi: "erc20:totalSupply",
    }),
    sdk.api.abi.multiCall({
      block,
      calls: batcherCalls,
      abi: batcherAbi.pendingDeposit,
    }),
    sdk.api.abi.multiCall({
      block,
      calls: vaultCalls,
      abi: vaultAbi.wantToken,
    }),
  ]).then((o) => o.map((it) => it.output));

  return { totalSupplies, pendingDeposits, tokens };
};

const getVaultL1Funds = async (vault, wantToken, block) => {
  const executors = await getExecutorsForVault(vault, block);
  const positionCalls = executors.map((e) => ({ target: e }));
  const balanceCalls = executors.map((e) => ({ target: wantToken, params: e }));

  const [_wantTokenBalances, _positionValues] = await Promise.all([
    sdk.api.abi.multiCall({
      block,
      calls: balanceCalls,
      abi: "erc20:balanceOf",
    }),
    sdk.api.abi.multiCall({
      block,
      calls: positionCalls,
      abi: teAbi.positionInWantToken,
    }),
  ]).then((o) => o.map((it) => it.output));

  const wantTokenBalances = _wantTokenBalances.map((it) => +it.output);
  const positionValues = _positionValues.map((it) => +it.output.posValue);

  let totalExecutorFunds = 0

  for (const [index] of executors.entries()) {
    totalExecutorFunds += wantTokenBalances[index] + positionValues[index]
  }

  const vaultBalance = await sdk.api.abi.call({
    block,
    target: wantToken,
    params: vault,
    abi: "erc20:balanceOf",
  });

  return totalExecutorFunds + +vaultBalance.output;
};

const getExecutorsForVault = async (vault, block) => {
  var index = 0;
  let flag = true;

  const executors = [];

  while (flag) {
    try {
      const { output } = await sdk.api.abi.call({
        block,
        target: vault,
        abi: vaultAbi.executorByIndex,
        params: index,
      });

      executors.push(output);
    } catch (e) {
      flag = false;
    }

    index++;
  }

  return executors;
};

module.exports = {
  vaults,
  getTVLData,
  getVaultL1Funds,
};

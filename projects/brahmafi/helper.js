const vaultAbi = require("./vault.json");
const batcherAbi = require("./batcher.json");
const teAbi = require("./tradeExecutor.json");
const erc4626Abi = require("./erc4626.json");

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

const erc4626Vaults = [
  {
    address: "0x2D3B10fc395B109DC32B71D14CdD523E471F14EF",
    chain: "polygon",
  },
];

const l1OnlyVaults = [
  {
    address: "0xB3dA8d6Da3eDe239ccbF576cA0Eaa74D86f0e9D3",
    isYieldGenerating: false,
    chain: "ethereum",
  },
  {
    address: "0x4FE66bff98eFc030BdC86c733F481B089fb9DCFd",
    isYieldGenerating: true,
    chain: "polygon",
  },
];

const getTVLData = async (api) => {
  const _vaults = vaults.map((v) => v.address);
  const batchers = vaults.map((v) => v.batcher);

  const [ pendingDeposits, tokens] = await Promise.all([
    api.multiCall({ calls: batchers, abi: batcherAbi.pendingDeposit, }),
    api.multiCall({ calls: _vaults, abi: vaultAbi.wantToken, }),
  ])
  api.add(tokens, pendingDeposits)
  await api.sumTokens({ tokensAndOwners2: [tokens, _vaults], });
  const executors = await api.fetchList({  lengthAbi: 'totalExecutors', itemAbi: 'executorByIndex', targets: _vaults})
  const eTokens = await api.multiCall({  abi: 'address:vaultWantToken', calls: executors })
  const eFunds = await api.multiCall({ abi: teAbi.positionInWantToken, calls: executors })
  const bals = eFunds.map((it) => it.posValue);
  api.add(eTokens, bals);
};

const getL1VaultOnlyFundsByChain = async (api) => {
  const vaults = l1OnlyVaults.filter(({ chain }) => chain === api.chain).map(i => i.address)
  const yvaults = erc4626Vaults.filter((it) => it.chain === api.chain && it.isYieldGenerating).map((v) => v.address);
  const tokens = await api.multiCall({ abi: vaultAbi.wantToken, calls: vaults })
  const bals = await api.multiCall({ abi: vaultAbi.totalVaultFunds, calls: vaults })
  const ytokens = await api.multiCall({ abi: erc4626Abi.asset, calls: yvaults })
  const ybals = await api.multiCall({ abi: vaultAbi.lastEpochYield, calls: yvaults })

  api.add(tokens, bals)
  api.add(ytokens, ybals)
}

const getERC4626VaultFundsByChain = async (api) => {
  const vaults = erc4626Vaults.filter((it) => it.chain === api.chain).map((v) => v.address);
  const tokens = await api.multiCall({ abi: erc4626Abi.asset, calls: vaults })
  const bals = await api.multiCall({ abi: erc4626Abi.totalAssets, calls: vaults })

  api.add(tokens, bals)
}

module.exports = {
  getTVLData,
  getERC4626VaultFundsByChain,
  getL1VaultOnlyFundsByChain,
};

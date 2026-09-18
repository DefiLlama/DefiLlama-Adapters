const { getProcolAddresses } = require("../alpaca-finance/lyf");
const abi = {
  "vaultDebtVal": "uint256:vaultDebtVal",
  "totalToken": "uint256:totalToken",
  "pendingInterest": "function pendingInterest(uint256 value) public view returns (uint256)",
  "balanceOf": "function balanceOf(address account) view returns (uint256)"
};
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  /// @dev Getting all addresses from Github
  const addresses = await getProcolAddresses(api.chain)
  return sumTokens2({ api, tokensAndOwners: addresses["Vaults"].map(v => [v.baseToken, v.address]) })
}

async function borrowed(api) {
  /// @dev Getting all addresses from Github
  const addresses = await getProcolAddresses(api.chain);

  const vaultsDebtVal = await api.multiCall({
    abi: abi.vaultDebtVal,
    calls: addresses["Vaults"].map((v) => v.address),
  })

  const vaultsPendingInterest = await pendingInterest(addresses, api);
  addresses["Vaults"].forEach((v, i) => {
    api.add(v.baseToken, +vaultsPendingInterest[i] + +vaultsDebtVal[i])
  })
}

async function pendingInterest(addresses, api) {
  return api.multiCall({
    abi: abi.pendingInterest,
    calls: addresses["Vaults"].map((v) => {
      return { target: v.address, params: [0] };
    }),
  })
}

// node test.js projects/alpaca-finance-lend/index.js
module.exports = {
  start: '2020-10-07',
  methodology: "Sum floating balance and vaultDebtValue in each vault",
  bsc: { tvl, borrowed, },
  fantom: { tvl, borrowed, },
};

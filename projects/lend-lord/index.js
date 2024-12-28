const { sumTokens2 } = require('../helper/unwrapLPs')
const LEND_LORD_VAULT_CONTRACT = "0xC6A6fB7238457277E913665e194BA1f041B210f5";

async function tvl(api) {
  const tokens = await api.call({ abi: abi.getAssets, target: LEND_LORD_VAULT_CONTRACT })
  return sumTokens2({ api, owner: LEND_LORD_VAULT_CONTRACT, tokens })
}

async function borrowed(api) {
  const tokens = await api.call({ abi: abi.getAssets, target: LEND_LORD_VAULT_CONTRACT })
  const balances = await api.multiCall({ abi: abi.getAssetTotalBorrowBalance, calls: tokens, target: LEND_LORD_VAULT_CONTRACT })
  api.addTokens(tokens, balances)
  return api.getBalances()
}

const abi = {
  getAssets: "address[]:getAssets",
  getAssetTotalBorrowBalance: "function  getAssetTotalBorrowBalance(address) view returns (uint256 amount)",
};

module.exports = {
  manta: { tvl, borrowed },
};

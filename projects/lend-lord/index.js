const { sumTokens2 } = require('../helper/unwrapLPs')
const LEND_LORD_VAULT_CONTRACT = "0x05c576786B1B96C69917eDc4E8162D39aFe03cD0";

async function tvl(_, _b, _cb, { api, }) {
  const tokens = await api.call({ abi: abi.getAssets, target: LEND_LORD_VAULT_CONTRACT })
  return sumTokens2({ api, owner: LEND_LORD_VAULT_CONTRACT, tokens })
}

async function borrowed(_, _b, _cb, { api, }) {
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

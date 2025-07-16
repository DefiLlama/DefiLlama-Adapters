const sdk = require("@defillama/sdk");
const ADDRESSES = require("../helper/coreAssets.json");
const { cachedGraphQuery } = require("../helper/cache");

async function tvl(api) {
  const tokens = await api.call({
    target: "0x17b07cfbab33c0024040e7c299f8048f4a49679b",
    abi: "address[]:getAllLTokens",
  });
  const assets = await api.multiCall({ calls: tokens, abi: "address:asset" });
  const totalAssets = await api.multiCall({
    calls: tokens,
    abi: "uint256:totalAssets",
  });
  api.addTokens(assets, totalAssets);

  // const userAccounts = await api.call({ target: "0x17b07cfbab33c0024040e7c299f8048f4a49679b", abi: "address[]:getAllAccounts", })
  const data = await cachedGraphQuery(
    "sentiment",
    sdk.graph.modifyEndpoint("H4hxkyy4kLmFsZZCatedvHpWT1ZvqKcfv2FFYXLxDm9W"),
    query,
    { fetchById: true }
  );
  const userAccounts = data.map((i) => i.id);
  const [equity, borrows] = await Promise.all([
    api.multiCall({
      target: "0xc0ac97A0eA320Aa1E32e9DEd16fb580Ef3C078Da",
      calls: userAccounts,
      abi: "function getBalance(address account) view returns (uint256)",
      permitFailure: true,
    }),
    api.multiCall({
      target: "0xc0ac97A0eA320Aa1E32e9DEd16fb580Ef3C078Da",
      calls: userAccounts,
      abi: "function getBorrows(address account) view returns (uint256)",
      permitFailure: true,
    }),
  ]);
  for (let i = 0; i < equity.length; i++) {
    const equity_ = equity[i] ?? 0;
    const borrow = borrows[i] ?? 0;
    api.add(ADDRESSES.arbitrum.WETH, equity_ - borrow);
  }
  return api.getBalances();
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  arbitrum: { tvl },
};

const query = `query get_accounts($lastId: String!) {
  accounts(
    first: 1000
    where: {and: [{id_gt: $lastId}, {or: [{balance_gt: 0}, {debt_gt: 0}]}]}
  ) {
    id
    balance
    debt
  }
}`;

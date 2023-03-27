const sdk = require("@defillama/sdk");

async function tvl(timestamp, ethBlock, { arbitrum: block }) {
  const chain = "arbitrum";
  const tokens = (
    await sdk.api.abi.call({
      block,
      chain,
      target: "0x17b07cfbab33c0024040e7c299f8048f4a49679b",
      abi: "address[]:getAllLTokens",
    })
  ).output;
  const assets = (
    await sdk.api.abi.multiCall({
      block,
      chain,
      calls: tokens.map((t) => ({ target: t })),
      abi: "address:asset",
    })
  ).output;
  const totalAssets = (
    await sdk.api.abi.multiCall({
      block,
      chain,
      calls: tokens.map((t) => ({ target: t })),
      abi: "uint256:totalAssets",
    })
  ).output;
  const balances = assets.reduce((bals, asset, i) => {
    sdk.util.sumSingleBalance(
      bals,
      `arbitrum:${asset.output}`,
      totalAssets[i].output
    );
    return bals;
  }, {});
  const userAccounts = (
    await sdk.api.abi.call({
      block,
      chain,
      target: "0x17b07cfbab33c0024040e7c299f8048f4a49679b",
      abi: "address[]:getAllAccounts",
    })
  ).output;
  const equity = (
    await sdk.api.abi.multiCall({
      block,
      chain,
      calls: userAccounts.map((t) => ({
        target: "0xc0ac97A0eA320Aa1E32e9DEd16fb580Ef3C078Da",
        params: [t],
      })),
      abi: "function getBalance(address account) view returns (uint256)",
    })
  ).output;
  const borrows = (
    await sdk.api.abi.multiCall({
      block,
      chain,
      calls: userAccounts.map((t) => ({
        target: "0xc0ac97A0eA320Aa1E32e9DEd16fb580Ef3C078Da",
        params: [t],
      })),
      abi: "function getBorrows(address account) view returns (uint256)",
    })
  ).output;
  for (let i = 0; i < equity.length; i++) {
    sdk.util.sumSingleBalance(
      balances,
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      equity[i].output - borrows[i].output
    );
  }
  return balances;
}

async function borrowed(timestamp, ethBlock, { arbitrum: block }) {
  const balances = {};
  const chain = "arbitrum";
  const tokens = (
    await sdk.api.abi.call({
      block,
      chain,
      target: "0x17b07cfbab33c0024040e7c299f8048f4a49679b",
      abi: "address[]:getAllLTokens",
    })
  ).output;
  const assets = (
    await sdk.api.abi.multiCall({
      block,
      chain,
      calls: tokens.map((t) => ({ target: t })),
      abi: "address:asset",
    })
  ).output;

  const borrows = (
    await sdk.api.abi.multiCall({
      block,
      chain,
      calls: tokens.map((t) => ({ target: t })),
      abi: "uint256:borrows",
    })
  ).output;

  for (let i = 0; i < tokens.length; i++) {
    sdk.util.sumSingleBalance(
      balances,
      `arbitrum:${assets[i].output}`,
      borrows[i].output
    );
  }
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  arbitrum: { tvl },
};

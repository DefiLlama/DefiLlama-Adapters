async function tvl(timestamp, ethBlock, { arbitrum: block }, { api }) {
  const tokens = await api.call({ target: "0x17b07cfbab33c0024040e7c299f8048f4a49679b", abi: "address[]:getAllLTokens", })
  const assets = await api.multiCall({ calls: tokens, abi: "address:asset", })
  const totalAssets = await api.multiCall({ calls: tokens, abi: "uint256:totalAssets", })
  api.addTokens(assets, totalAssets)

  const userAccounts = await api.call({ target: "0x17b07cfbab33c0024040e7c299f8048f4a49679b", abi: "address[]:getAllAccounts", })
  const [equity, borrows] = await Promise.all([
    api.multiCall({ target: "0xc0ac97A0eA320Aa1E32e9DEd16fb580Ef3C078Da", calls: userAccounts, abi: "function getBalance(address account) view returns (uint256)", }),
    api.multiCall({ target: "0xc0ac97A0eA320Aa1E32e9DEd16fb580Ef3C078Da", calls: userAccounts, abi: "function getBorrows(address account) view returns (uint256)", }),
  ])
  for (let i = 0; i < equity.length; i++)
    api.add('0x82af49447d8a07e3bd95bd0d56f35241523fbab1', equity[i] - borrows[i], {})
}

async function borrowed(timestamp, ethBlock, { arbitrum: block }, { api }) {
  const tokens = await api.call({ target: "0x17b07cfbab33c0024040e7c299f8048f4a49679b", abi: "address[]:getAllLTokens", })
  const assets = await api.multiCall({ calls: tokens, abi: "address:asset", })
  const borrows = await api.multiCall({ calls: tokens, abi: "uint256:borrows", })
  api.addTokens(assets, borrows)
}

module.exports = {
  misrepresentedTokens: true,
  arbitrum: { tvl, },
  hallmarks: [
    [Math.floor(new Date('2023-04-04')/1e3), 'Protocol was hacked for 1 million'],
  ],
};

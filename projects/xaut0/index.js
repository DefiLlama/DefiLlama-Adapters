const ethereumOAdapterUpgradeable = "0xb9c2321BB7D0Db468f570D10A424d1Cc8EFd696C";
const xaut = "0x68749665FF8D2d112Fa859AA293F07A622782F38";

async function tvl(api) {
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: xaut,
    params: [ethereumOAdapterUpgradeable],
  });

  api.add(xaut, balance);
}

module.exports = {
  start: 1745360435,
  ethereum: {
    tvl,
  },
};

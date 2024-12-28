const StakePools = [
  '0xe384251B5f445A006519A2197bc6bD8E5fA228E5',
  '0x0448FddC3f4D666eC81DAc8172E60b8e5852386c',
  '0x357DEeD02020b73F8A124c4ea2bE3B6A725aaeC2',
  '0xD7BC2FE1d0167BD2532587e991abE556E3a66f3b',
  '0xD5193B851bf7C751BBA862Eca1298D4B4Cb17B81',
];

async function tvl(api) {
  const bals = await api.multiCall({ abi: 'uint256:getTotalUnderlying', calls: StakePools })
  const configs = await api.multiCall({ abi: "function getConfig() view returns ((address underlying, address protocolToken, uint16 maxStakers))", calls: StakePools })
  const tokens = configs.map(i => i.underlying)
  api.add(tokens, bals)
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  }
};

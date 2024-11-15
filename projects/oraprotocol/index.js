const contracts = [
  "0xc0b2FdA4EDb0f7995651B05B179596b112aBE0Ff",
  "0x0a7Df7BC7a01A4b6C9889d5994196C1600D4244a",
  "0x5982241e50Cb4C42cb51D06e74A97EAaCa3a8CE2",
  "0xDF03600C34cacE7496A0A8Ef102B4bCe718958a2",
  "0x3e0598fee8a73d09c06b3de3e205ba7ff8edb004"
];


module.exports = {
  ethereum: {
    tvl, staking,
  }
};

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:stakingTokenAddress', calls: contracts })
  return api.sumTokens({ tokensAndOwners2: [tokens, contracts] })
}

async function staking(api) {

  const contracts = [
    "0x07b022bd57e22c8c5abc577535cf25e483dae3df",
    "0x4f5e12233ed7ca1699894174fcbd77c7ed60b03d",
  ];
  const tokens = await api.multiCall({ abi: 'address:stakingTokenAddress', calls: contracts })
  return api.sumTokens({ tokensAndOwners2: [tokens, contracts] })
}
const evmPRISMAddr = {
  ethereum: "0x06Bb4ab600b7D22eB2c312f9bAbC22Be6a619046",
}

async function ethTVL(api) {
  const prism = await api.call({
    abi: "uint256:totalSupply",
    target: evmPRISMAddr.ethereum,
  })

  api.add(evmPRISMAddr.ethereum, prism)
}

module.exports = {
  ethereum: { tvl: ethTVL },
}

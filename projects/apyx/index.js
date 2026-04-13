const foundationWallets = [
  '0xabdd8c8ee69e5f5180eb9352aeffc5ceead65e96',
  '0x6f93635f2a1c19b4f7f1bd9ba655f6a073c629dc',
  '0xf9862efc1704ac05e687f66e5cd8c130e5663ce2',
  '0x37B0779A66edc491df83e59a56D485835323a555',
  '0xbfBcF5B00698A7ab9305c252a25009e8cfac0852',
]

const config = {
  ethereum: {
    apxUSD: '0x98A878b1Cd98131B271883B390f68D2c90674665',
    apyUSD: '0x38EEb52F0771140d10c4E9A9a72349A329Fe8a6A',
    ccipPool: '0x0e9cA42Bc60bE25F9A67f52173067Cc0Bb405BB5',
  },
  base: {
    apxUSD: '0xD993935E13851dd7517af10687EC7e5022127228',
    apyUSD: '0x2c271ddF484aC0386d216eB7eB9Ff02D4Dc0F6AA',
  },
}

async function tvl(api) {
  const chain = api.chain
  const { apxUSD, apyUSD } = config[chain]

  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: apxUSD })

  const apxBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: foundationWallets.map(w => ({ target: apxUSD, params: [w] })),
  })

  const apyBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: foundationWallets.map(w => ({ target: apyUSD, params: [w] })),
  })

  const totalApyShares = apyBalances.reduce((sum, b) => sum + Number(b), 0)

  let apyAsApxUSD = 0
  if (totalApyShares > 0 && chain === 'ethereum') {
    const converted = await api.call({
      abi: 'function convertToAssets(uint256) view returns (uint256)',
      target: apyUSD,
      params: [BigInt(Math.floor(totalApyShares)).toString()],
    })
    apyAsApxUSD = Number(converted)
  }

  let bridgeLocked = 0
  if (chain === 'ethereum') {
    const ccipApxBal = await api.call({
      abi: 'erc20:balanceOf',
      target: apxUSD,
      params: [config.ethereum.ccipPool],
    })
    bridgeLocked = Number(ccipApxBal)
  }

  const totalApxHeld = apxBalances.reduce((sum, b) => sum + Number(b), 0)
  const inventory = totalApxHeld + apyAsApxUSD
  const circulating = (Number(totalSupply) - inventory - bridgeLocked) / 1e18

  api.addCGToken('apxusd', circulating)
}

module.exports = {
  misrepresentedTokens: true,
  start: '2026-02-17',
  methodology: "TVL is the circulating supply of apxUSD per chain — total supply minus Foundation wallet holdings and CCIP bridge-locked tokens. apyUSD vault holdings are converted to apxUSD value. apyUSD is excluded from TVL to avoid double-counting.",
  ethereum: { tvl },
  base: { tvl },
}

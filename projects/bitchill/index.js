const HANDLERS = [
  {
    handler: '0xb60024d0030d7876f02BB766E18F0664e81B0856',
    lendingToken: '0x544Eb90e766B405134b3B3F62b6b4C23Fcd5fDa2', // kDOC (Tropykus)
    stablecoin: '0xe700691dA7b9851F2F35f8b8182c69c53CcaD9Db', // DOC
    protocol: 'tropykus',
  },
  {
    handler: '0xA1A752784d4d43778ED23771777B18AE9cb66461',
    lendingToken: '0xd8D25f03EBbA94E15Df2eD4d6D38276B595593c1', // iSUSD (Sovryn iToken)
    protocol: 'sovryn',
  },
  {
    handler: '0xAfcD7A6F5165F09b049ded06EEC12F5A9E3D09A2',
    lendingToken: '0xDdf3CE45fcf080DF61ee61dac5Ddefef7ED4F46C', // kUSDRIF (Tropykus)
    stablecoin: '0x3A15461d8aE0F0Fb5Fa2629e9DA7D66A794a6e37', // USDRIF
    protocol: 'tropykus',
  },
]

async function tvl(api) {
  await Promise.all(HANDLERS.map(async (config) => {
    if (config.protocol === 'tropykus') {
      const [balance, exchangeRate] = await Promise.all([
        api.call({
          target: config.lendingToken,
          abi: 'erc20:balanceOf',
          params: [config.handler]
        }),
        api.call({
          target: config.lendingToken,
          abi: 'function exchangeRateStored() view returns (uint256)'
        })
      ])

      const underlyingBalance = (BigInt(balance) * BigInt(exchangeRate)) / (10n ** 18n)
      api.add(config.stablecoin, underlyingBalance)
      return
    }

    if (config.protocol === 'sovryn') {
      const [stablecoin, underlyingBalance] = await Promise.all([
        api.call({
          target: config.lendingToken,
          abi: 'address:loanTokenAddress'
        }),
        api.call({
          target: config.lendingToken,
          abi: 'function assetBalanceOf(address _owner) view returns (uint256)',
          params: [config.handler]
        }),
      ])
      api.add(stablecoin, underlyingBalance)
      return
    }

    throw new Error(`Unknown protocol "${config.protocol}" (lendingToken: ${config.lendingToken}, handler: ${config.handler})`)
  }))
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL is the sum of underlying stablecoin value (DOC, USDRIF) held by BitChill DCA handlers on Rootstock. Deposits are routed into lending protocols (Tropykus, Sovryn), so this TVL overlaps with those protocols. Tropykus positions are computed from kToken balances using exchangeRateStored(); Sovryn positions are computed using assetBalanceOf() and attributed to the iToken underlying (loanTokenAddress()).',
  rsk: { tvl },
}
/**
 * BitChill DCA Protocol - DefiLlama TVL Adapter
 * 
 * BitChill is a DCA (Dollar Cost Averaging) protocol on Rootstock that allows
 * users to deposit stablecoins (DOC, USDRIF) and automatically purchase rBTC
 * on a schedule. User deposits are held in lending protocols (Tropykus, Sovryn)
 * to earn yield while waiting for scheduled purchases.
 * 
 * TVL = Sum of underlying stablecoin values across all handlers
 */

const HANDLERS = {
  tropykusDoc: {
    handler: '0xb60024d0030d7876f02BB766E18F0664e81B0856',
    lendingToken: '0x544Eb90e766B405134b3B3F62b6b4C23Fcd5fDa2', // kDOC
    stablecoin: '0xe700691dA7b9851F2F35f8b8182c69c53CcaD9Db',  // DOC
    protocol: 'tropykus'
  },
  sovrynDoc: {
    handler: '0xA1A752784d4d43778ED23771777B18AE9cb66461',
    lendingToken: '0xd8D25f03EBbA94E15Df2eD4d6D38276B595593c1', // iSUSD
    stablecoin: '0xe700691dA7b9851F2F35f8b8182c69c53CcaD9Db',  // DOC
    protocol: 'sovryn'
  },
  tropykusUsdrif: {
    handler: '0xAfcD7A6F5165F09b049ded06EEC12F5A9E3D09A2',
    lendingToken: '0xDdf3CE45fcf080DF61ee61dac5Ddefef7ED4F46C', // kUSDRIF
    stablecoin: '0x3A15461d8aE0F0Fb5Fa2629e9DA7D66A794a6e37',  // USDRIF
    protocol: 'tropykus'
  }
};

async function tvl(api) {
  for (const [name, config] of Object.entries(HANDLERS)) {
    let underlyingBalance;

    if (config.protocol === 'tropykus') {
      // Tropykus (Compound fork): underlying = kTokenBalance * exchangeRate / 1e18
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
      ]);
      underlyingBalance = (BigInt(balance) * BigInt(exchangeRate)) / BigInt(1e18);
    } else if (config.protocol === 'sovryn') {
      // Sovryn: assetBalanceOf returns underlying balance directly
      underlyingBalance = await api.call({
        target: config.lendingToken,
        abi: 'function assetBalanceOf(address _owner) view returns (uint256)',
        params: [config.handler]
      });
    }

    api.add(config.stablecoin, underlyingBalance);
  }
}

module.exports = {
  methodology: 'TVL is calculated by summing the underlying stablecoin value (DOC, USDRIF) held in DCA schedule handlers. For Tropykus handlers, this is kToken balance multiplied by the exchange rate. For Sovryn handlers, this is the assetBalanceOf value. Accumulated rBTC from completed purchases is not included as it represents idle capital awaiting withdrawal.',
  rsk: {
    tvl
  }
};

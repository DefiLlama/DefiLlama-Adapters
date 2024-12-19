const sdk = require("@defillama/sdk");
const { getLogs } = require('../helper/cache/getLogs');

module.exports = {
  methodology: 'TVL counts the tokens deposited in the boring vaults.',
  start: 1733726867
}

const config = {
  ethereum: {
    vaults: {
      scUSD: {
        token: '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE',
        fromBlock: 21363111
      },
      scETH: {
        token: '0x3bcE5CB273F0F148010BbEa2470e7b5df84C7812',
        fromBlock: 21363247
      },
    },
  },
  sonic: {
    vaults: {
      scUSD: {
        token: '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE',
        fromBlock: 588028
      },
      scETH: {
        token: '0x3bcE5CB273F0F148010BbEa2470e7b5df84C7812',
        fromBlock: 591868
      },
    },
  },
}

Object.keys(config).forEach(chain => {
  const { vaults } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const balances = {}

      await Promise.all(Object.keys(vaults).map(async vault => {
        const { token, fromBlock } = vaults[vault]

        const depositLogs = await getLogs({
          api,
          target: token,
          eventAbi: 'event Enter(address indexed from, address indexed asset, uint256 amount, address indexed to, uint256 shares)',
          onlyArgs: true,
          fromBlock: fromBlock,
        })
        const withdrawLogs = await getLogs({
          api,
          target: token,
          eventAbi: 'event Exit(address indexed to, address indexed asset, uint256 amount, address indexed from, uint256 shares)',
          onlyArgs: true,
          fromBlock: fromBlock,
        })

        // Compute balances based on the enter and exit logs for each asset
        depositLogs.forEach(log => {
          const { to, amount, asset } = log
          if (amount == 0) {
            return;
          }
          if (!balances[asset]) {
            balances[asset] = {}
          }
          if (!balances[asset][to]) {
            balances[asset][to] = amount
          } else {
            balances[asset][to] += amount;
          }
        })

        withdrawLogs.forEach(log => {
          const { from, amount, asset } = log
          if (amount == 0) {
            return;
          }
          if (!balances[asset]) {
            balances[asset] = {}
          }
          if (!balances[asset][from]) {
            balances[asset][from] = -amount
          } else {
            balances[asset][from] -= amount;
          }
        });
      }))

      const protocolBalances = {}
      Object.keys(balances).forEach(asset => {
        Object.keys(balances[asset]).forEach(user => {
          if (balances[asset][user] != 0) {
            sdk.util.sumSingleBalance(protocolBalances, asset, balances[asset][user])
          }
        })
      })
      return protocolBalances;
    }
  }
})
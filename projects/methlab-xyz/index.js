const { getLogs2 } = require('../helper/cache/getLogs')
const { mergeExports } = require('../helper/utils')
const { uniV3Export } = require('../helper/uniswapV3')


const abi = {
  evt_Strategy: 'event StrategyStatusChange (address indexed strategy, bool status)',
  evt_VaultAdded: 'event VaultAdded (address indexed vault)',
  evt_LoanAdded: 'event LoanAdded (address indexed vault, address indexed loan, address loanImplUsed)',
  strategy_collToken: 'address:collToken',
  strategy_borrowToken: 'address:borrowToken'
}

const config = {
  mantle: { factory: '0xB375DfF90F8dafeA50E2EA7a0666B426Ed786C5D', fromBlock: 69177970 }
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain];

  module.exports[chain] = {
    tvl: async (api) => {
      const logArgs = { api, target: factory, fromBlock };

      const strategies = (await getLogs2({ ...logArgs, eventAbi: abi.evt_Strategy, extraKey: 'strategy' })).map(log => log.strategy);
      const vaults = (await getLogs2({ ...logArgs, eventAbi: abi.evt_VaultAdded, extraKey: 'vault' })).map(log => log.vault);
      const loans = (await getLogs2({ ...logArgs, eventAbi: abi.evt_LoanAdded, extraKey: 'loan' })).map(log => log.loan);

      const collTokens = await api.multiCall({ abi: abi.strategy_collToken, calls: strategies });
      const borrowTokens = await api.multiCall({ abi: abi.strategy_borrowToken, calls: strategies });
      const tokens = collTokens.concat(borrowTokens)
      return api.sumTokens({ tokens, owners: loans.concat(vaults), blacklistedTokens: ['0x401307732d732dd3b05ac1138b8661c0f55830ea'] });
    }
  }
});

module.exports = mergeExports([
  module.exports,
  uniV3Export({
    mantle: { factory: "0x8f140Fc3e9211b8DC2fC1D7eE3292F6817C5dD5D", fromBlock: 59915640 },
  })
])
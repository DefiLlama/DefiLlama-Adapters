const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: {
    moduleFactory: '0x00A3699F677C252CA32B887F9f66621920D392f8',
    moduleFactoryStart: 16970379,
    lineFactory: '0xc9ef6509a09b92043cedce689dfaa760048abd7f',
    lineFactoryStart: 16970396,
  },
  // xdai: {
  //   moduleFactory: '0x00A3699F677C252CA32B887F9f66621920D392f8',
  //   moduleFactoryStart: 27253390,
  //   lineFactory: '0xc9ef6509a09b92043cedce689dfaa760048abd7f',
  //   lineFactoryStart: 27253485,
  // },
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { moduleFactory, moduleFactoryStart, lineFactory, lineFactoryStart, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      const escrowLogs = await getLogs({
        api,
        target: moduleFactory,
        topics: ['0x795112e1546f70e94f47252ccd7189f90d711b2e6557885dc3def7b589c7f7ac'],
        eventAbi: 'event DeployedEscrow (address indexed deployedAt, uint32 indexed minCRatio, address indexed oracle, address owner)',
        onlyArgs: true,
        fromBlock: moduleFactoryStart,
      })
      const lineLogs = await getLogs({
        api,
        target: lineFactory,
        topics: ['0xc043ebb31424e42a4ec1454f0de8a7ab9ba0443b8b556c538484c873ae8e64b5'],
        eventAbi: 'event DeployedSecuredLine (address indexed deployedAt, address indexed escrow, address indexed spigot, address swapTarget, uint8 revenueSplit)',
        onlyArgs: true,
        fromBlock: lineFactoryStart,
      })

      await Promise.all(escrowLogs.map(async (log) => {
        const escrow = log.deployedAt
        const tokenLogs = await getLogs({
          api,
          target: escrow,
          topic: 'EnableCollateral(address)',
          eventAbi: 'event EnableCollateral(address indexed token)',
          onlyArgs: true,
          fromBlock: moduleFactoryStart,
        })
        ownerTokens.push([tokenLogs.map(i => i.token), escrow])
      }))
      await Promise.all(lineLogs.map(async (log) => {
        const target = log.deployedAt
        const counts = await api.call({ abi: "function counts() view returns (uint256, uint256)", target })
        const calls = []
        for (let i = 0; i < counts[0]; i++) calls.push(i)
        const proposals = await api.multiCall({ abi: "function ids(uint256) view returns (bytes32)", calls, target })
        const credits = await api.multiCall({ abi: "function credits(bytes32) view returns (uint256 deposit, uint256 principal, uint256 interestAccrued, uint256 interestRepaid, uint8 decimals, address token, address lender, bool isOpen)", calls: proposals, target })
        ownerTokens.push([credits.map(i => i.token), target])
      }))
      return sumTokens2({ api, ownerTokens })
    },
    borrowed: async (api) => {
      const lineLogs = await getLogs({
        api,
        target: lineFactory,
        topics: ['0xc043ebb31424e42a4ec1454f0de8a7ab9ba0443b8b556c538484c873ae8e64b5'],
        eventAbi: 'event DeployedSecuredLine (address indexed deployedAt, address indexed escrow, address indexed spigot, address swapTarget, uint8 revenueSplit)',
        onlyArgs: true,
        fromBlock: lineFactoryStart,
      })

      await Promise.all(lineLogs.map(async (log) => {
        const target = log.deployedAt
        const counts = await api.call({ abi: "function counts() view returns (uint256, uint256)", target })
        const calls = []
        for (let i = 0; i < counts[0]; i++) calls.push(i)
        const proposals = await api.multiCall({ abi: "function ids(uint256) view returns (bytes32)", calls, target })
        const credits = await api.multiCall({ abi: "function credits(bytes32) view returns (uint256 deposit, uint256 principal, uint256 interestAccrued, uint256 interestRepaid, uint8 decimals, address token, address lender, bool isOpen)", calls: proposals, target })
        credits.map(i => {
          api.add(i.token, i.principal)
          // api.add(i.token, i.interestAccrued)
          // api.add(i.token, i.interestRepaid * -1)
        })
      }))
      return api.getBalances()
    }
  }
})
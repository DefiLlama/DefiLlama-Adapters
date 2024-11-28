const { CHAIN } = require("../helpers/chains");

module.exports = {
  adapter: {
    [CHAIN.ETHEREUM]: {
      fetch: async ({ getLogs, createBalances }) => {
        const balances = createBalances()
        
        // Get Funded events
        const fundedLogs = await getLogs({
          target: '0x6659423929E1a00119fc3F79C8C4F443cc6fd36f',
          eventAbi: 'event Funded(address indexed funder, uint256 indexed amount)'\
        })
        
        // Get FundedOnBehalf events
        const fundedOnBehalfLogs = await getLogs({
          target: '0x6659423929E1a00119fc3F79C8C4F443cc6fd36f',
          eventAbi: 'event FundedOnBehalf(address funder, address funderAccountAddress, uint256 amount)'
        })

        // TODO subtract these events from total TVL.
        // event ETHWithdrawnForUser(address recipient, address requestedBy, uint256 amount);
        // event EmergencyWithdrawn(address recipient, uint256 amount);

        // TODO add WithdrawalVault events as well
        // contract address is 0x22B35d437b3999F5C357C176adEeC1b8b0F35C13
        // events are:
        // event ETHReceived(uint256 amount, address sender); -- add to TVL
        // event ETHWithdrawn(address recipient, address requestedBy, uint256 amount); -- subtract from TVL

        // Sum up amounts from both types of events
        fundedLogs.forEach(log => {
          balances.addGasToken(log.amount)
        })
        
        fundedOnBehalfLogs.forEach(log => {
          balances.addGasToken(log.amount)
        })

        return { tvl: balances }
      },
      start: 1691539200,
    },
  },
  version: 2,
}

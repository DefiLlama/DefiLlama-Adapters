const { getLogs } = require("../helper/cache/getLogs");

module.exports = {
  ethereum: {
    tvl: async (api) => {
      // const balances = [] 

      // Get Funded events
      const fundedLogs = await getLogs({
        api,
        target: "0x6659423929E1a00119fc3F79C8e4F443cc6fd36f",
        topics: [
          "0x5af8184bef8e4b45eb9f6ed7734d04da38ced226495548f46e0c8ff8d7d9a524",
        ],
        eventAbi: "event Funded (address indexed funder, uint256 indexed amount)",
        fromBlock: 20966151,
        onlyArgs: true,
        // TODO: Maybe comment out below when pushing to prod.
        skipCache: true,
      })

      // Get FundedOnBehalf events
      const fundedOnBehalfLogs = await getLogs({
        api,
        target: '0x6659423929E1a00119fc3F79C8e4F443cc6fd36f',
        eventAbi: 'event FundedOnBehalf(address funder, address funderAccountAddress, uint256 amount)',
        topics: [
          "0xf5baf49a435a1386a3e4802a5392df01b462b9659b7697dda89b23fa1d25efab"
        ],
        fromBlock: 20966151,
        onlyArgs: true,
        // TODO: Maybe comment out below when pushing to prod.
        skipCache: true,
      })

      // Get ETHWithdrawnForUser events
      const withdrawnForUserLogs = await getLogs({
        api,
        target: '0x6659423929E1a00119fc3F79C8e4F443cc6fd36f',
        eventAbi: 'event ETHWithdrawnForUser(address recipient, address requestedBy, uint256 amount)',
        topics: [
          "0x5cff4912c63fb0797e1a1a4c273b5ee945950749fff3f3c9f6f9c05bf036e54d"
        ],
        fromBlock: 20966151,
        onlyArgs: true,
        skipCache: true,
      })

      // Get EmergencyWithdrawn events
      const emergencyWithdrawnLogs = await getLogs({
        api,
        target: '0x6659423929E1a00119fc3F79C8e4F443cc6fd36f',
        eventAbi: 'event EmergencyWithdrawn(address recipient, uint256 amount)',
        topics: [
          "0x46028b2ed7ba45b83543eb4f43090c1511ee37d94f26792582213afa88b75b67"
        ],
        fromBlock: 20966151,
        onlyArgs: true,
        skipCache: true,
      })

      // console.log(fundedLogs)

      const totalFunds = fundedLogs.reduce((acc, curr) => acc + BigInt(curr.amount), 0n);
      const totalFundsOnBehalf = fundedOnBehalfLogs.reduce((acc, curr) => acc + BigInt(curr.amount), 0n);
      console.log('Individual funds:', fundedLogs)
      console.log('Individual fundsOnBehalf:', fundedOnBehalfLogs)
      console.log('Total funds:', totalFunds.toString())
      console.log('Total fundsOnBehalf:', totalFundsOnBehalf.toString())

      // Verify sums match
      // TODO: Remove this when pushing to prod.
      const manualSum = fundedLogs.reduce((acc, curr) => acc + BigInt(curr.amount), 0n) +
        fundedOnBehalfLogs.reduce((acc, curr) => acc + BigInt(curr.amount), 0n)
      console.log('Sum verification:', manualSum === (totalFunds + totalFundsOnBehalf) ? 'PASS' : 'FAIL')

      // Calculate total withdrawals
      const totalWithdrawnForUser = withdrawnForUserLogs.reduce((acc, curr) => acc + BigInt(curr.amount), 0n);
      const totalEmergencyWithdrawn = emergencyWithdrawnLogs.reduce((acc, curr) => acc + BigInt(curr.amount), 0n);
      
      console.log('Total withdrawn for users:', totalWithdrawnForUser.toString())
      console.log('Total emergency withdrawn:', totalEmergencyWithdrawn.toString())

      // Calculate final TVL by subtracting withdrawals
      const finalTVL = (totalFunds + totalFundsOnBehalf) - (totalWithdrawnForUser + totalEmergencyWithdrawn);
      console.log('Final TVL:', finalTVL.toString())

      // api.add('0x0000000000000000000000000000000000000000', finalTVL);
      return { '0x0000000000000000000000000000000000000000': finalTVL };
    },
  },
}
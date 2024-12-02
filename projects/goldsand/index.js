const { getLogs } = require("../helper/cache/getLogs");
const sdk = require("@defillama/sdk")

module.exports = {
  methodology: 'TVL is the sum of deposits minus the sum of withdrawals. Since there is no liquid staking token (yet) and deposited ETH greater than 32 is automatically staked in the beacon chain, the contract balance itself is not the TVL.',
  hallmarks: [
    [1732231247, "Privately staked funds deposited to contract."],
  ],
  ethereum: {
    tvl: async (api) => {
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

      const totalFunds = fundedLogs.reduce((acc, curr) => acc + BigInt(curr.amount), 0n);
      const totalFundsOnBehalf = fundedOnBehalfLogs.reduce((acc, curr) => acc + BigInt(curr.amount), 0n);

      // Calculate total withdrawals
      const totalWithdrawnForUser = withdrawnForUserLogs.reduce((acc, curr) => acc + BigInt(curr.amount), 0n);

      // The withdrawl vault holds validator rewards until withdrawn.
      const { output: withdrawlVaultBalance } = await sdk.api.eth.getBalance({ target: '0x22B35d437b3999F5C357C176adEeC1b8b0F35C13' })

      const finalTVL = (totalFunds + totalFundsOnBehalf) - (totalWithdrawnForUser) + BigInt(withdrawlVaultBalance);

      return { '0x0000000000000000000000000000000000000000': finalTVL };
    },
  },
}

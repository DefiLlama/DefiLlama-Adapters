const { getLogs2 } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/tokenMapping");

function customCacheFunction({ cache, logs }) {
  logs = logs.filter(log => (log.funderAccountAddress !== '0x22B35d437b3999F5C357C176adEeC1b8b0F35C13') && (log.recipient !== '0x22B35d437b3999F5C357C176adEeC1b8b0F35C13'))
  if (!cache.logs) cache.logs = []
  let sum = cache.logs[0] ?? 0
  sum = logs.reduce((acc, curr) => acc + Number(curr.amount), sum)
  cache.logs = [sum]
  return cache
}

module.exports = {
  methodology: 'TVL is the sum of deposits minus the sum of withdrawals. Since there is no liquid staking token (yet) and deposited ETH greater than 32 is automatically staked in the beacon chain, the contract balance itself is not the TVL.',
  hallmarks: [
    [1732231247, "Privately staked funds deposited to contract."],
  ],
  timetravel: false,
  ethereum: {
    tvl: async (api) => {
      // Get Funded events
      const [fundedLogs] = await getLogs2({
        api,
        target: "0x6659423929E1a00119fc3F79C8e4F443cc6fd36f",
        extraKey: 'Funded',
        eventAbi: "event Funded (address indexed funder, uint256 indexed amount)",
        fromBlock: 20966151,
        customCacheFunction,
      })

      // Get FundedOnBehalf events
      const [fundedOnBehalfLogs] = await getLogs2({
        api,
        target: '0x6659423929E1a00119fc3F79C8e4F443cc6fd36f',
        extraKey: 'FundedOnBehalf',
        eventAbi: 'event FundedOnBehalf(address funder, address funderAccountAddress, uint256 amount)',
        fromBlock: 20966151,
        customCacheFunction,
      })

      // Get ETHWithdrawnForUser events
      const [withdrawnForUserLogs] = await getLogs2({
        api,
        target: '0x6659423929E1a00119fc3F79C8e4F443cc6fd36f',
        extraKey: 'ETHWithdrawnForUser',
        eventAbi: 'event ETHWithdrawnForUser(address recipient, address requestedBy, uint256 amount)',
        fromBlock: 20966151,
        customCacheFunction,
      })

      api.addGasToken((fundedLogs + fundedOnBehalfLogs - withdrawnForUserLogs).toString())
    },
  },
}

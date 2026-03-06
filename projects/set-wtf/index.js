const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

const setProtocolContract = '0x2506CB864df6336d93A87C4af2b644fd61cF4d81'

// Event signatures and topics
const eventAbis = {
  Deposited: 'event Deposited(address indexed user, uint256 amount)',
  WithdrawalProcessed: 'event WithdrawalProcessed(address indexed user, uint256 amount)',
}

const eventTopics = {
  Deposited: '0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4',
  WithdrawalProcessed: '0x5abb0fc89def2ee3226cc48f5621ee8e2b45f6dcc7898d2bdb5d480533c32bc0',
}

const abi = { usdt: 'address:usdt' }

async function tvl(api) {
  // Verify USDT token matches
  const usdtAddress = await api.call({ target: setProtocolContract, abi: abi.usdt })
  if (usdtAddress.toLowerCase() !== ADDRESSES.ethereum.USDT.toLowerCase()) return

  // Start from the contract deployment block provided
  const fromBlock = 22926962

  // Fetch parsed logs (amounts)
  const deposits = await getLogs({ api, target: setProtocolContract, topics: [eventTopics.Deposited], eventAbi: eventAbis.Deposited, onlyArgs: true, fromBlock, extraKey: 'Deposited' })
  const withdrawals = await getLogs({ api, target: setProtocolContract, topics: [eventTopics.WithdrawalProcessed], eventAbi: eventAbis.WithdrawalProcessed, onlyArgs: true, fromBlock, extraKey: 'WithdrawalProcessed' })

  let totalDeposits = 0n
  // Only user deposits count toward TVL
  deposits.forEach(i => totalDeposits += BigInt(i.amount))
  // Note: AdminDeposited is excluded from TVL

  let totalWithdrawals = 0n
  // Only user withdrawals reduce TVL
  withdrawals.forEach(i => totalWithdrawals += BigInt(i.amount))
  // Note: AdminWithdrawn is excluded from TVL (cold storage transfers)


  const netTvl = totalDeposits - totalWithdrawals
  if (netTvl > 0n) api.add(ADDRESSES.ethereum.USDT, netTvl.toString())
}

module.exports = {
  start: '2025-07-01',
  ethereum: { tvl },
  methodology: 'TVL = sum(user Deposited) - sum(user WithdrawalProcessed). AdminDeposited and AdminWithdrawn are excluded (admin treasury/cold storage flows). All values are derived from on-chain events since deployment.'
}

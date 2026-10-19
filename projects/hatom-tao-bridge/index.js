const { getSystemAccount } = require('../helper/chain/substrate')

const TREASURY_ADDRESS = "5HZAAREPzwBc4EPWWeTHA2WRcJoCgy4UBk8mwYFWR5BTCNcT";

const tvl = async (api) => {
  const { free, reserved } = await getSystemAccount('bittensor', TREASURY_ADDRESS, { balanceBytes: 8 }) // TAO balances are u64
  api.addCGToken('bittensor', Number(free + reserved) / 1e9)
}

module.exports = {
  timetravel: false,
  methodology: 'Value of tao locked in the bridge contract',
  bittensor: { tvl },
}

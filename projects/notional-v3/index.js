const { sumTokens2 } = require('../helper/unwrapLPs');
const abi = require('../notional/abi');

const contract = "0x1344A36A1B56144C3Bc62E7757377D288fDE0369"

async function tvl(timestamp, block, _, { api }) {
  let oracles = await api.fetchList({ lengthAbi: abi.getMaxCurrencyId, itemAbi: abi.getPrimeCashHoldingsOracle, target: contract, startFromOne: true, })
  let underlying = await api.multiCall({ abi: 'address:underlying', calls: oracles.map((o) => ({ target: o})) })
  let holdings = await api.multiCall({ abi: 'address[]:holdings', calls: oracles.map((o) => ({ target: o})) })
  let tokens = underlying.concat(holdings.flatMap((_) => _))
  return sumTokens2({ tokens, owner: contract, api })
}

module.exports = {
  arbitrum: { tvl }
};
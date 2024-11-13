const { getTokenSupplies } = require('../helper/solana')
const { ripple } = require('../helper/chain/rpcProxy')

const tbill = "0xdd50C053C096CB04A3e3362E2b622529EC5f2e8a"
const solTbill = '4MmJVdwYN8LwvbGeCowYjSx7KoEi6BJWg8XXnW4fDDp6'

async function evmTvl(api) {
  let contract = tbill
  if (api.chain === 'arbitrum') contract = '0xF84D28A8D28292842dD73D1c5F99476A80b6666A'
  const [bal, token] = await api.batchCall([
    { abi: 'uint256:totalAssets', target: contract },
    { abi: 'address:underlying', target: contract },
  ])
  api.add(token, bal)
}

async function solTvl (api) {
  const res = await getTokenSupplies([solTbill])
  console.log(res)
  Object.entries(res).forEach(([token, balance]) => {
    api.add(token, balance)
  })
}

async function ripplTvl (api) {
  const issuerAddress = "rJNE2NNz83GJYtWVLwMvchDWEon3huWnFn";
  const subscriptionOperatorAddress = "rB56JZWRKvpWNeyqM3QYfZwW4fS9YEyPWM";

  const data = await ripple.gatewayBalances({ account: issuerAddress, hotwallet: subscriptionOperatorAddress })
  api.add(tbill, Number(data.obligations?.TBL) * 1e6, { skipChain: true })
}

module.exports = {
  ethereum: { tvl: evmTvl },
  arbitrum: { tvl: evmTvl },
  ripple: { tvl: ripplTvl },
  solana: { tvl: solTvl }
}
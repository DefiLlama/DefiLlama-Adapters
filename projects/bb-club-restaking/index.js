const BBTC = '0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC'

async function BTCFIStaking(api) {
  const totalStake = await api.call({abi: 'uint256:totalStaked', target: '0x0d5d4599eb4f48df6aeaf2f3c814f5a5302931e5'})
  api.add(BBTC, totalStake)
}


module.exports = {
  bouncebit: {
    tvl: BTCFIStaking
  }
}
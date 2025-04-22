const bank = '0xceF63C8507004a8d079daE3c83e369De0Adfa7Aa'

async function tvl(api) {
  const [bankToken, bankBalance] = await Promise.all([
    api.multiCall({ abi: 'address:baseToken', calls: [bank], }),
    api.multiCall({ abi: 'uint256:getLastUpdatedModulesBalance', calls: [bank], }),
  ])
  api.addTokens(bankToken, bankBalance)
}

module.exports = {
  methodology: 'Gets the total balance in the Goblin Bank from the amount allocated in the different strategies.',
  arbitrum: {
    tvl,
  }
};
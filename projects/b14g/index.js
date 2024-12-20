const { getLogs2 } = require("../helper/cache/getLogs");
const { sumTokens } = require("../helper/chain/bitcoin");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  core: {
    tvl: async function tvl(api) {
      const logs = await getLogs2({
        api,
        target: "0x04EA61C431F7934d51fEd2aCb2c5F942213f8967",
        eventAbi: 'event CreateRewardReceiver(address indexed from, address indexed rewardReceiver, uint256 portion, uint256 time)',
        fromBlock: 19942300,
      })
      const receiverRewards = logs.map(i => i.rewardReceiver)
      const coreStakeAmounts = await api.multiCall({ abi: 'uint256:totalCoreStake', calls: receiverRewards })
      api.addGasToken(coreStakeAmounts)
    }
  },
  bitcoin: {
    tvl: async () => {
      let owners = await bitcoinAddressBook.b14g()
      return sumTokens({ owners })
    }
  }
}



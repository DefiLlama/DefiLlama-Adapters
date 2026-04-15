const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { getHypercoreStakedHype } = require('../helper/chain/hyperliquid')

const accountant = '0x9209648Ec9D448EF57116B73A2f081835643dc7A'

const abis = {
  kHYPEToHYPE: "function kHYPEToHYPE(uint256 kHYPEAmount) view returns (uint256)",
  totalQueuedWithdrawals: "function totalQueuedWithdrawals() view returns (uint256)",
}

const managers = [
  '0x393D0B87Ed38fc779FD9611144aE649BA6082109', // kHype
  '0xaD492f9CADcccE9c3c213edd8aE55c152cD3A3ad', // hiHype
  '0xfdd35c5179E8594E237031dd945E0584Af29572b', // flowHype
  '0x0c5d890Cf52973aE4A7b10fA7EE18e146d13D87B', // asxnHype
  '0x09B4cdA849037D1717e91D201EE416bf1c113895', // hylqHype
]

const tvl = async (api) => {
  await api.sumTokens({ owners: managers, tokens: [ADDRESSES.null] })

  const buffBalance = await api.call({ target: "0x393D0B87Ed38fc779FD9611144aE649BA6082109", abi: abis.totalQueuedWithdrawals })
  const hypeBalance = await api.call({ target: accountant, params: [buffBalance], abi: abis.kHYPEToHYPE })
  api.addGasToken(hypeBalance)

  const stakedBalances = await Promise.all(managers.map(m => getHypercoreStakedHype(m)))
  for (const bal of stakedBalances) {
    api.addGasToken(bal)
  }
}

module.exports = {
  timetravel: false,
  hyperliquid: {
    tvl, staking: staking('0x696238e0Ca31c94e24ca4CBe7921754E172E4d0F', '0x000000000000780555bD0BCA3791f89f9542c2d6')
  },
}

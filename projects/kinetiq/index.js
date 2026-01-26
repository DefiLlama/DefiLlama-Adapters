const axios = require('axios');
const { staking } = require('../helper/staking')
const sdk = require('@defillama/sdk')

const HYPERLIQUID_MAINNET_RPC_URL = 'https://api.hyperliquid.xyz';

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

const getUserStakingSummary = async (user) => {
  const url = `${HYPERLIQUID_MAINNET_RPC_URL}/info`;
  const response = await axios.post(url, { type: 'delegatorSummary', user });
  return response.data;
};

const tvl = async (api) => {
  const [_hypeBalances, _delegatedBalances] = await Promise.all([
    Promise.all(managers.map((m) => sdk.api.eth.getBalance({ target: m, chain: 'hyperliquid' }))),
    Promise.all(managers.map((m) => getUserStakingSummary(m)))
  ]);

  const buffBalance = await api.call({ target: "0x393D0B87Ed38fc779FD9611144aE649BA6082109", abi: abis.totalQueuedWithdrawals })
  const hypeBalance = await api.call({ target: accountant, params: [buffBalance], abi: abis.kHYPEToHYPE })
  api.addGasToken(hypeBalance)

  managers.forEach((_, index) => {
    const hypeBalance = _hypeBalances[index].output
    const _delegatedBalance = _delegatedBalances[index]
    const { delegated, undelegated, totalPendingWithdrawal } = _delegatedBalance
    const delegatedBalance = (+delegated + +undelegated - +totalPendingWithdrawal) * 1e18
    api.addGasToken(+hypeBalance + delegatedBalance)
  })
}

module.exports = {
  timetravel: false,
  hyperliquid: {
    tvl, staking: staking('0x696238e0Ca31c94e24ca4CBe7921754E172E4d0F', '0x000000000000780555bD0BCA3791f89f9542c2d6')
  },
}

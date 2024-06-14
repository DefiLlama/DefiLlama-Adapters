const { staking } = require('../helper/staking')

const VETH_CONTRACT = '0x38D64ce1Bdf1A9f24E0Ec469C9cAde61236fB4a0';
const VEC_CONTRACT = '0x1BB9b64927e0C5e207C9DB4093b3738Eef5D8447';

async function tvl(api) {
  const tokens = await api.fetchList({ lengthAbi: 'approvedTokens', itemAbi: 'approvedRestakedLSTs', target: VETH_CONTRACT })
  return api.sumTokens({ owner: VETH_CONTRACT, tokens, })
}

module.exports = {
  methodology: 'Value of ETH and LSD tokens in VETH contract',
  start: 19067821,
  ethereum: {
    tvl,
    pool2: staking(['0x2dd568028682ff2961cc341a4849f1b32f371064'], ['0xB6B0C651C37EC4ca81C0a128420e02001A57Fac2', '0x6685fcFCe05e7502bf9f0AA03B36025b09374726']),
    staking: staking(['0xFdC28cd1BFEBF3033870C0344B4E0beE639be9b1'], VEC_CONTRACT),
  }
}; 
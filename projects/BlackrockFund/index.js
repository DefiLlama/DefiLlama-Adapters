const BTCStakingABI = require('./BTCStakingABI.json');

const BTC_TOKEN_CONTRACT = '0xbD6323A83b613F668687014E8A5852079494fB68';
const BTC_STAKING_CONTRACT = '0x1FDe0d2F44539789256D94D1784a86bF77D66DD0';

async function tvl(_, _1, _2, { api }) {
  const totalBTCStaked = (await api.call({
    abi: BTCStakingABI,
    target: BTC_STAKING_CONTRACT,
    params: [0],
  }))[1];

  api.add(BTC_TOKEN_CONTRACT, totalBTCStaked)
}

module.exports = {
    misrepresentedTokens: true,
    methodology: 'staked BTC',
    ethereum: {
      tvl,
    }
}; 
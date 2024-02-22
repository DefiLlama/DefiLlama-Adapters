const BTCStakingABI = require('./BTCStakingABI.json');
const LPStakingABI = require('./LPStakingABI.json');

const BTC_TOKEN_CONTRACT = '0xbD6323A83b613F668687014E8A5852079494fB68';
const ABTC_TOKEN_CONTRACT = '0xa709aaD0691Fc67279577566640ae1D6515c1b81';
const LP_TOKEN_CONTRACT = '0x4b398fCd7841412610b653B34E89c9b19a42EbFc';
const BTC_STAKING_CONTRACT = '0x1FDe0d2F44539789256D94D1784a86bF77D66DD0';
const LP_STAKING_CONTRACT = '0x1e4A10d18698E4450E13b4E8EF361a5841850611';

async function tvl(_, _1, _2, { api }) {
  const totalBTCStaked = (await api.call({
    abi: BTCStakingABI,
    target: BTC_STAKING_CONTRACT,
    params: [0],
  }))[1];

  const totalaBTCSupply = await api.call({
    abi: 'uint256:totalSupply',
    target: ABTC_TOKEN_CONTRACT,
    params: [],
  });

  const totalLPStaked = (await api.call({
    abi: LPStakingABI,
    target: LP_STAKING_CONTRACT,
    params: [0],
  }))[1];

  api.add(BTC_TOKEN_CONTRACT, totalaBTCSupply);
  api.add(BTC_TOKEN_CONTRACT, totalBTCStaked);
  api.add(LP_TOKEN_CONTRACT, totalLPStaked);
}

module.exports = {
    misrepresentedTokens: true,
    methodology: 'staked BTC',
    ethereum: {
      tvl,
    }
}; 
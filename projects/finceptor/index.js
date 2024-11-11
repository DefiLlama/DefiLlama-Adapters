const FINC_TOKEN_CONTRACT = '0xA856098dCBc1b2B3a9C96C35c32bC4f71E49AEd2';
const FINCEPTOR_STAKING_AMOUNTS_CONTRACT = '0xA8a15EC4D496521D3a4B70e3cC2c15fF1701E3BE';

async function staking(api) {
  const stakedBalance = await api.call({ abi: 'uint256:totalStaked', target: FINCEPTOR_STAKING_AMOUNTS_CONTRACT, })
  api.add(FINC_TOKEN_CONTRACT, stakedBalance)
}

module.exports = {
  methodology: 'gets the total number of FINC tokens locked in all active staking contracts of Finceptor.',
  bsc: {
    tvl: () => ({}),
    staking,
  }
}
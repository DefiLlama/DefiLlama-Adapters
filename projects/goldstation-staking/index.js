const klayStakingContract = '0x6569B14043c03537B5B125F5Ac5De3605a47dC76';

async function tvl(api) {
  const totalStaked = await api.call({ target: klayStakingContract, abi: "uint256:totalStaked", });
  api.addGasToken(totalStaked);
}

module.exports = {
  klaytn: { tvl }
}


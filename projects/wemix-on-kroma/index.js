const sdk = require('@defillama/sdk');



const tvl = async (_, _1, _2, { api }) => {
  const wemixEContract = '0x3720b1dc2c8dde3bd6cfcf0b593d0a2bbcac856e';
  const stakingContract = '0xA5c7992710A94A2ef2e8E910b441bD70385DBAB8'

  const balanceOfStakingContract = (await sdk.api.erc20.balanceOf({
    target: wemixEContract,
    owner:stakingContract,
      chain: 'kroma',
      decimals: 18
  })).output;

  return {"wemix-token": balanceOfStakingContract}
}


module.exports["kroma"] = {
  methodology: "The balance of WEMIX.e tokens staked in Staking Wemix Contract on kroma chain",
  tvl,
}

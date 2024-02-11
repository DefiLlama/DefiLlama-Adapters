const sdk = require('@defillama/sdk');



const tvl = async (_, _1, _2, { api }) => {
  const wemixEContract = '0x3720b1dc2c8dde3bd6cfcf0b593d0a2bbcac856e';

  const wemixESupply = (await sdk.api.erc20.totalSupply({
      target: wemixEContract,
      chain: 'kroma',
      decimals: 18
  })).output;

  return {"wemix-token": wemixESupply}
}


module.exports["kroma"] = {
  methodology: "The total supply of WEMIX.e tokens transferred from the Wemix chain",
  tvl,
}

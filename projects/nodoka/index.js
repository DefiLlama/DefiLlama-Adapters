const nethContract = "0xf2e51185caaded6c63d587943369f0b5df169344";

async function tvl(api) {
  const nethTotalSupply = await api.call({
    target: nethContract,
    abi: 'erc20:totalSupply',
  });
  api.add(nethContract, nethTotalSupply);
}


module.exports = {
  ethereum: {
    tvl,
  },
};

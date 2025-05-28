
async function tvl(api) {
  const totalSupply = await api.call({ target: '0xEff8378C6419b50C9D87f749f6852d96D4Cc5aE4', abi: "erc20:totalSupply", });
  api.addGasToken(totalSupply);
}

module.exports = {
  bfc: {
    tvl,
  }
}
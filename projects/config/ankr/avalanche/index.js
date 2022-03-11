const { aAVAXbTokenContract } = require('./contracts');

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

const getaAVAXbTvl = async () => {
  const totalSupply = await aAVAXbTokenContract.methods.totalSupply().call();
  console.log(111, `aAVAXb ${totalSupply}`);
  // return { [tokenAddresses.aETHc]: totalSupply };
  return { [wethAddress]: totalSupply };
}

module.exports = {
  getaAVAXbTvl
}
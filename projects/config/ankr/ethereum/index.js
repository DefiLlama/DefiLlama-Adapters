const tokenAddresses = require('./tokenAddresses');
const { aETHcTokenContract, aMATICbTokenContract, aDOTbTokenContract, aKSMbTokenContract } = require('./contracts');

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

const getaETHcTvl = async () => {
  const totalSupply = await aETHcTokenContract.methods.totalSupply().call();
  return { [wethAddress]: totalSupply };
}

const getaMATICbTvl = async () => {
  const totalSupply = await aMATICbTokenContract.methods.totalSupply().call();
  return { "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0": totalSupply };
}

const getaDOTbTvl = async () => {
  const totalSupply = await aDOTbTokenContract.methods.totalSupply().call();
  return { "bsc:0x7083609fce4d1d8dc0c979aab8c869ea2c873402": totalSupply };
}

const getaKSMbTvl = async () => {
  const totalSupply = await aKSMbTokenContract.methods.totalSupply().call();
  return { kusama: Number(totalSupply)/1e18 };
}

module.exports = {
  getaETHcTvl,
  getaMATICbTvl,
  getaDOTbTvl,
  getaKSMbTvl,
}
const tokenAddresses = require('./tokenAddresses');
const { aETHcTokenContract, aMATICbTokenContract, aDOTbTokenContract, aKSMbTokenContract } = require('./contracts');

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

const getaETHcTvl = async () => {
  const totalSupply = await aETHcTokenContract.methods.totalSupply().call();
  console.log(111, `aETHc ${totalSupply}`);
  // return { [tokenAddresses.aETHc]: totalSupply };
  return { [wethAddress]: totalSupply };
}

const getaMATICbTvl = async () => {
  const totalSupply = await aMATICbTokenContract.methods.totalSupply().call();
  console.log(111, `aMATICb ${totalSupply}`)
  // return { [tokenAddresses.aMATICb]: totalSupply };
  return { [wethAddress]: totalSupply };
}

const getaDOTbTvl = async () => {
  const totalSupply = await aDOTbTokenContract.methods.totalSupply().call();
  console.log(111, `aDOTb ${totalSupply}`)
  // return { [tokenAddresses.aDOTb]: totalSupply };
  return { [wethAddress]: totalSupply };
}

const getaKSMbTvl = async () => {
  const totalSupply = await aKSMbTokenContract.methods.totalSupply().call();
  console.log(111, `aKSMb ${totalSupply}`)
  // return { [tokenAddresses.aKSMb]: totalSupply };
  return { [wethAddress]: totalSupply };
}

module.exports = {
  getaETHcTvl,
  getaMATICbTvl,
  getaDOTbTvl,
  getaKSMbTvl,
}
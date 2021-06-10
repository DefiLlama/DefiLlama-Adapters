const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const { abis } = require('./config/eurxb/abis.js');
const { tokensAddress, infuraKey } = require('./config/eurxb/constants.js');
const { getContractInstance } = require('./config/eurxb/utils.js');
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${infuraKey}`))

const getSat = async () => {
	const contract = await getContractInstance(abis.eurxb, tokensAddress.eurxb);
	const result = await contract.methods.totalSupply().call();
	return web3.utils.fromWei(result);
};

const getBond = async () => {
	const contract = await getContractInstance(abis.bond, tokensAddress.bond);
	const result = await contract.methods.totalValue().call();
	return web3.utils.fromWei(result);
};

const getEurxb = async () => {
	const contract = await getContractInstance(abis.sat, tokensAddress.sat);
	const result = await contract.methods.totalValue().call();
	return web3.utils.fromWei(result);
};

const fetch = async () => {
	const sat = await getSat();
	const bond = await getBond();
	const eurxb = await getEurxb();

	const tvl = new BigNumber(sat)
		.plus(new BigNumber(bond))
		.plus(new BigNumber(eurxb));

	return tvl.isGreaterThan(0) ? tvl.toString() : '0';
};

module.exports = {
	fetch
}

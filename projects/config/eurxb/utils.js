const Web3 = require('web3');
const { infuraKey } = require('./constants.js');
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${infuraKey}`))

const getContractInstance = (abi, address) => {
	const abiFromJson = JSON.parse(JSON.stringify(abi));
	const instance = new web3.eth.Contract(abiFromJson, address);
	return instance;
};

module.exports = { getContractInstance };

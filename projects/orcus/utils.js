const ethers = require('ethers')
const provider =  new ethers.providers.JsonRpcProvider(`https://astar.api.onfinality.io/rpc?apikey=5b7ed0e0-5ce6-4bf9-875b-d19bc4d3de5e`) 

const getContractInstance = (abi, address) => {

	const instance = new ethers.Contract(address, abi, provider)
	return instance;
};

module.exports = { getContractInstance };

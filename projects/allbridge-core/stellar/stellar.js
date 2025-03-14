const TokenContract = require('./token-contract');
const sorobanEndpoint = 'https://mainnet.sorobanrpc.com';

async function getTokenBalance(tokenAddress, contractAddress) {
    const tokenContract = await getContract(TokenContract, tokenAddress);
    return (await tokenContract.balance({id: contractAddress})).result.toString();
}

async function getContract(Contract, address) {
    const config = {
        contractId: address,
        networkPassphrase: 'Public Global Stellar Network ; September 2015',
        rpcUrl: sorobanEndpoint,
    };
    return new Contract(config);
}

module.exports = {
    getTokenBalance
}

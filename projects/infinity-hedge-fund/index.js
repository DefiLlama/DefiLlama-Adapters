const TOKEN_CONTRACT = '0x3B9728bD65Ca2c11a817ce39A6e91808CceeF6FD';
const STAKING_CONTRACT = '0x042Fef60aD51f48C65E6106F9b950178910A3300';
 
async function tvl(api) {
    const contractBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: TOKEN_CONTRACT,
        params: [STAKING_CONTRACT],
    }); 
    
    api.add(TOKEN_CONTRACT, contractBalance);
}   

module.exports = {
    methodology: 'Get the balance of tokens in staking contract',
    base: {
        tvl,
    }
};

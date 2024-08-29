const ADDRESSES = require('../helper/coreAssets.json')

const WBTC = ADDRESSES.ethereum.WBTC;
const swBTC = '0x8DB2350D78aBc13f5673A411D4700BCF87864dDE'

async function tvl(api) {
    const totalSupply = await api.call({ target: swBTC, abi: 'uint256:totalSupply'});
    const rate = await api.call({ target: swBTC, abi: 'uint256:pricePerShare'});
    
    return {
      [WBTC]: (totalSupply * rate)/1e8
    };
}

module.exports = {
    doublecounted: true,
    ethereum: {
        tvl,
    },
}
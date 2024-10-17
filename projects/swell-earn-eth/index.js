
const ADDRESSES = require('../helper/coreAssets.json')

const earnETH = '0x9Ed15383940CC380fAEF0a75edacE507cC775f22';
const accountant = '0x411c78BC8c36c3c66784514f28c56209e1DF2755';
const WETH = ADDRESSES.ethereum.WETH;

async function tvl(api) {
    const totalSupply = await api.call({ target: earnETH, abi: 'uint256:totalSupply'});
    const rate = await api.call({ target: accountant, abi: 'uint256:getRate'});
    
    return {
      [WETH]: (totalSupply * rate)/1e18
    };
}

module.exports = {
    methodology: 'earnETH supply multiplied by earnETH rate',
    doublecounted: true,
    ethereum: {
        tvl,
    },
}
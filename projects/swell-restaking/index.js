const { nullAddress } = require("../helper/tokenMapping")

async function tvl(api) {
    const totalSupply = await api.call({ target: '0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0', abi: 'uint256:totalSupply'});
    const rate = await api.call({ target: '0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0', abi: 'uint256:getRate'});
    
    return {
      [nullAddress]: (totalSupply * rate)/1e18
    };
}

module.exports = {
    doublecounted: true,
    ethereum: {
        tvl,
    },
}
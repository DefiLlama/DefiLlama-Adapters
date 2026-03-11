const BigNumber = require("bignumber.js");
const XU3O8_CONTRACT = '0x79052Ab3C166D4899a1e0DD033aC3b379AF0B1fD';

async function tvl(api) {

    const [totalSupply] = await Promise.all([
        api.call({ abi: "uint256:totalSupply", target: XU3O8_CONTRACT }),
      ]);

    const value = parseInt(totalSupply)
    api.add(XU3O8_CONTRACT, value)
}    

module.exports = {
  methodology: 'Counts the balance of tokens in the XU3O8 contract',
  etlk: {
    tvl,
  },
}; 
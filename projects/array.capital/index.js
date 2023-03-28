const sdk = require('@defillama/sdk');

const token = "0x53Fd70B568e5C8DACe2cE3c38E650F5924BeB1c1";
const masterchef = "0xA55Cb77E8CeBc3fe517044d0AaA923d541a69e71";

const stakingToken = token.toLowerCase();
async function getTvl(chainBlocks) {

  let locked = (await sdk.api.erc20.balanceOf({
    target: token,
    owner: masterchef,
    block: chainBlocks.arbitrum,
    chain: 'arbitrum'
  })).output;

  return locked;
}

module.exports = {
  arbitrum: {
    tvl: getTvl
  }
}

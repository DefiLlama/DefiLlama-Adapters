const sdk = require('@defillama/sdk');

const token = "0x164731CD270daA4A94bc70761E53320e48367B8B";
const masterchef = "0x1b91b24d12C934383f25aa07C2c9C9666accf39e";

const stakingToken = token.toLowerCase();
async function getTvl(chainBlocks) {

  let locked = (await sdk.api.erc20.balanceOf({
    target: token,
    owner: masterchef,
    block: chainBlocks.arbitrum,
    chain: 'arbitrum'
  })).output;

  console.log("locked: ", locked)
  return locked;
}

module.exports = {
  arbitrum: {
    tvl: getTvl
  }
}

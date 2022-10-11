const sdk = require('@defillama/sdk');
const ethers = require('ethers');
const ROUTER_CONTRACT_ABI = require('./abi/primaryRouter.json');

const ATT_ADDRESS = "0x90D53b872ce6421122B41a290aCdD22a5eD931bd"
const ROUTER_ADDRESS = "0x96418df8b474e90e49183cc23fa41e4ad8b0ddbe"

const ROUTER_CONTRACT = new ethers.Contract(
  ROUTER_ADDRESS,
  ROUTER_CONTRACT_ABI,
  new ethers.providers.AlchemyProvider()
);

const formatBigNumber = (amount, units = 18) => {
  return ethers.utils.formatUnits(amount, units);
};

async function tvl(_, block, __) {
  const tokenData = await ROUTER_CONTRACT.tokenData(ATT_ADDRESS);

  const totalSupply = (await sdk.api.erc20.totalSupply({ target: ATT_ADDRESS, block })).output

  const tvl = formatBigNumber(totalSupply) * formatBigNumber(tokenData.issuancePrice, 11);

  return {
    ethereum: tvl
  }
}

module.exports = {
  methodology: 'Gets the value of all tokens managed through frigg.eco universe',
  start: 15575809,
  ethereum: {
    tvl
  },
}
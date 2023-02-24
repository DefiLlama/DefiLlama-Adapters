const { getChainTransform } = require("../helper/portedTokens")
const { addFundsInMasterChef } = require('../helper/masterchef')
const MASTERCHEF = "0xbD40a260Ddd78287ddA4C4ede5880505a9fEdF9a"

async function tvl (timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const chain = 'polygon'
  const transformAddress = await getChainTransform(chain);
  await addFundsInMasterChef(balances, MASTERCHEF, chainBlocks[chain], chain, transformAddress);
  return balances;
}

module.exports = {
  polygon: {  tvl,  },
}


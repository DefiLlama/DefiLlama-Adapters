const sdk = require('@defillama/sdk');

const contracts = {
  stKAIA: '0x42952B873ed6f7f0A7E4992E2a9818E3A9001995',
  node: '0x7949597f453592B782EC9036Af27d63Ed9774b2d',
}

async function tvl(api) {
  const chain = 'klaytn'
  const tvl = await sdk.api.abi.call({ chain, target: contracts.node, abi: "uint256:getTotalStakingAmount" });

  return {
    [`${chain}:0x0000000000000000000000000000000000000000`]: tvl.output
  };
}

module.exports = {
	klaytn: { tvl }
}
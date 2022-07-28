const sdk = require('@defillama/sdk')
const { getBlock } = require('../helper/getBlock');


async function tvl(timestamp, ethBlock, chainBlocks) {
  const chain = "kcc"
  const block = await getBlock(timestamp, chain, chainBlocks, true)
  const totalLockedKCS = await sdk.api.abi.call({
    block,
    chain,
    target: "0x3CEF6d63C299938083D0c89C812d9C6985e3Af1c",
    abi:{ "inputs": [], "name": "getLatestLockedKCS", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
  })

  return {'kucoin-shares':Number(totalLockedKCS.output / 1e18)}
}




module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Staked token and staking rewards are counted as TVL',
  start: 12145436,
  kcc:{
    tvl:tvl,
  }

};

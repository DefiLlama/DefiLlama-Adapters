const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const abi = require("./abi.json");

const ethContract = ADDRESSES.ethereum.srETH;
const spoolLens = '0x8aa6174333F75421903b2B5c70DdF8DA5D84f74F';

async function eth(timestamp, ethBlock, chainBlocks) {
  const tvlETH = await sdk.api.abi.call({
    block: ethBlock,
    target: spoolLens,
    abi: abi["getSmartVaultAssetBalances"],
    params: [ethContract, false]
  });

  return {
    [ADDRESSES.null]: tvlETH.output[0],
  }
}

module.exports = {
  methodology: 'TVL is counted as deposits routed to the underlying Liquid Staking protocols in the vault.',
  timetravel: true,
  doublecounted: true, // tokens are stored in underlying LSDs
  ethereum: {
    tvl: eth
  }
}

const { ethers } = require("ethers");
const sdk = require("@defillama/sdk");

// Tegisto stakes
const stakeContractAddresses = {
  kava: '0x744Dd9f79b80437a9e5eb0292128045F51C48b6d',
}

function makeTvlFunction(chain) {
  return async function tvl(timestamp, block, chainBlocks) {
    var stakeBalance = (await sdk.api.abi.call({
      target: stakeContractAddresses[chain],
      abi: 'erc20:totalSupply',
      block: chainBlocks[chain],
      chain: chain
    })).output
    
    //providerBalance = [balance, totalCap]
    var staked = ethers.utils.formatEther(stakeBalance)
    return {
      'tegisto': staked,
    };
  }
}

module.exports = {
  methodology: 'TVL counts staked TGS tokens on the platform itself. CoinGecko is used to find the price of tokens in USD.',
  /*celo: {
    tvl: makeTvlFunction('celo'),
  },*/
  kava: {
    tvl: makeTvlFunction('kava'),
  },
};


const { ethers } = require("ethers");
const sdk = require("@defillama/sdk");

const stakeContractAddresses = {
  celo: '0x588069878442856b683ab39f410ed96b72fb542a',
  kava: '0x067543c3D97753dDA22A2cF6a806f47BD6A17B6A',
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
      'truefeedbackchain': staked,
    };
  }
}

module.exports = {
  methodology: 'TVL counts staked TFBX coins on the platform itself. CoinGecko is used to find the price of tokens in USD.',
  celo: {
    tvl: makeTvlFunction('celo'),
  },
  kava: {
    tvl: makeTvlFunction('kava'),
  },
};


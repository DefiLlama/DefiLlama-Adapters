const { ethers } = require("ethers");
const sdk = require("@defillama/sdk");

const stakeContractAddresses = {
  celo: '0x1DA2C9f15E2399960032dCF709B873712626ABF1',
  kava: '0x0281CBD3e40Ce01b514360a47BdB4dB26Dd76bc3',
}

function makeTvlFunction(chain) {
  return async function tvl(timestamp, block, chainBlocks) {
    var stakeBalance = (await sdk.api.abi.call({
      target: stakeContractAddresses[chain],
      abi: 'erc20:totalSupply',
      block: chainBlocks[chain],
      chain: chain
    })).output
    
    var staked = ethers.utils.formatEther(stakeBalance)
    return {
      'premio': staked,
    };
  }
}

module.exports = {
  methodology: 'TVL counts staked PREMIO coins on the platform itself. CoinGecko is used to find the price of tokens in USD.',
  celo: {
    tvl: makeTvlFunction('celo'),
  },
  kava: {
    tvl: makeTvlFunction('kava'),
  },
};


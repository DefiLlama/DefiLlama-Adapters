const config = require("./config");
const sdk = require("@defillama/sdk");

module.exports = {
  methodology: 'Counts the amount of stables locked in Owna protocol contracts',
};

config.chains.forEach(async chainInfo => {
  const {name: chain, tokens, lendingContract, nftContract} = chainInfo

  async function currentTokenId() {
    return (await sdk.api.abi.call({
      abi: "uint256:noOfTokenId",
      target: nftContract,
      chain
    })).output
  }

  async function getBorrow(tokenId) {
    return (await sdk.api.abi.call({
      abi: "function borrow(uint256) view returns (bool nft, bool isEntryFeePaid, bool isSold, uint256 nftId, uint256 offerType, uint256 loanAmount, uint256 debtPaid, uint256 lastUpdate, uint256 borrowedStartTime)",
      target: lendingContract,
      chain,
      params: [tokenId]
    })).output
  }

  async function totalBorrowed() {
    let total = 0;
    for (let i = 0; i < await currentTokenId(); i++) {
      const borrow = await getBorrow(i);
      total += parseInt(borrow.loanAmount);
    }

    return {
      usd: total / 10 ** 6,
    };
  }

  module.exports[chain] = {
    tvl: totalBorrowed
  }
})

const { get } = require('../helper/http')
const config = require("./config");
const sdk = require("@defillama/sdk");
const { sumTokensExport } = require('../helper/unwrapLPs')

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

  async function requestAgainstNft(tokenId, offerID) {
    return (await sdk.api.abi.call({
      abi: "function requestAgainstNft(uint256,uint256) view returns (uint256 offerID, uint256 offerType, uint256 nftId, uint256 durations, uint256 offerStartTime, uint256 apr, uint256 minLoan, uint256 maxLoan, uint256 loan, uint256 acceptable_debt, address lender, address borrower, string status)",
      target: lendingContract,
      chain,
      params: [tokenId, offerID]
    })).output
  }

  async function readDynamicInterest(tokenId, offerID) {
    return (await sdk.api.abi.call({
      abi: "function readDynamicInterest(uint256,uint256) view returns (uint256)",
      target: lendingContract,
      chain,
      params: [tokenId, offerID]
    })).output
  }

  async function getOffersCount(tokenId) {
    const backendUrl = chain === 'polygon' ? 'https://polygon-backend.owna.io' : 'https://backend.owna.io';
    return parseInt(await get(`${backendUrl}/offer/getOffersCount?mintId=` + tokenId));
  }

  async function totalOffers() {
    let total = 0;
    for (let i = 0; i < await currentTokenId(); i++) {
      const borrow = await getBorrow(i);
      if (parseInt(borrow.offerType) === 0) {
        var offerCount = await getOffersCount(i);
        if (offerCount > 0) {
          for (let j = 0; j < offerCount; j++) {
            var offer = await requestAgainstNft(i, j);
            if (offer.status == "Pending") {
              total += parseInt(offer.maxLoan);
            }
          }
        }
      }
    }
    return {
      usd: total / 10 ** 6,
    };
  }
  
  async function totalBorrowed() {
    let total = 0;
    let totalInterest = 0;
    for (let i = 0; i <= await currentTokenId(); i++) {
      const borrow = await getBorrow(i);
      if (!borrow.isEntryFeePaid) {
        total += parseInt(borrow.loanAmount);
        if (parseInt(borrow.offerType) > 0) {
          totalInterest += parseInt(await readDynamicInterest(i, 0));
      }
    }}
    return {
      usd: (total / 10 ** 6) + (totalInterest / 10 ** 6),
    };
  }

  module.exports[chain] = {
    tvl: sumTokensExport({ chain, tokens, owners: [lendingContract] }),
    borrowed: totalBorrowed,
    offers: totalOffers,
  }
})

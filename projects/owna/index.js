const config = require("./config");
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'Counts the amount of stables locked in Owna protocol contracts',
};

config.chains.forEach(async chainInfo => {
  const { name: chain, tokens, lendingContract, nftContract } = chainInfo

  async function borrowed(_, _1, _2, { api }) {
    const count = await api.call({ abi: 'uint256:noOfTokenId', target: nftContract })
    let calls = []
    for (let i = 0; i < count; i++) calls.push(i)
    const borrows = await api.multiCall({ calls, abi: 'function borrow(uint256) view returns (bool nft, bool isEntryFeePaid, bool isSold, uint256 nftId, uint256 offerType, uint256 loanAmount, uint256 debtPaid, uint256 lastUpdate, uint256 borrowedStartTime)', target: lendingContract })
    borrows.forEach(borrow => {
      if (!borrow.isEntryFeePaid)
        api.add(tokens[0], borrow.loanAmount - borrow.debtPaid)
    })
  }

  module.exports[chain] = {
    tvl: sumTokensExport({ tokens, owners: [lendingContract] }),
    borrowed,
  }
})

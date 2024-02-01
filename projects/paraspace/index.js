const { tvl, borrowed } = require("./helper/index");

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2023-03-17') / 1e3), 'Whitehat hack'],
    [Math.floor(new Date('2023-05-10') / 1e3), 'Team Dispute'],
  ],
  methodology: `TVL includes ERC-20 and ERC-721 tokens that have been supplied as well as ERC-20 tokens that are supplied for lending.`,
  ethereum: {
    tvl,
    borrowed,
  },
  arbitrum: {
    tvl,
    borrowed,
  },
  polygon: {
    tvl,
    borrowed,
  },
  era: {
    tvl,
    borrowed,
  },
  moonbeam: {
    tvl,
    borrowed,
  }
};

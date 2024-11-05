const { sumTokens2 } = require("../helper/solana");

async function tvl(api) {
  return sumTokens2({
    tokenAccounts: [
      'EmLhAPj7J6LTAnomsLfZUKDtb4t2A8e6eofDSfTwMgkY',
      'DY3Rw6BZwf6epvWnVo8DSV6kYptEdCh7HbYmFRpdPxuH',
      '3CppdkMFxuz7ASS27pB35EDbwgfUhwrarFYuWDBWWwHB',
      'Grk7mshVug1TafphUvuYBrzwRqadtmCcf7GGPoPKkgs6',
      'BpYbhwDZGpPvcKw3cSh5f9UqRaHfuxgz3avW9g324LUz',
      '4nyfJ4JBsRJLij7VGCVUeHwKSLAAku66ptJamoodY29L',
      '6opMSfkHgWsvG5KmZo8y2DuShaDHwXfB6VUuTx6W4Age',
      '4Ejjk5w7HAWvmXYT57s5uwn8rs7i61nbpcTRQ9ABB11M'
    ],
    balances: api.getBalances()
  })
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing the value of the traders' vault, LP vault, and earn vault.",
  solana: { tvl },
};

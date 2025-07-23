const { treasuryExports } = require("../helper/treasury");

const treasuryList = [
    'ENcCimzGPU6dNih1qnsSShTYBu9rRERnF4Wwx7BVVt7h',
]

const ownTokens = [
    '9ckR7pPPvyPadACDTzLwK2ZAEeUJ3qGSnzPs8bVaHrSy' //USDu
]

module.exports = treasuryExports({
  solana: {
    owners: treasuryList,
    ownTokens: ownTokens
  },
})
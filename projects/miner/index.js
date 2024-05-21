const { stakings } = require('../helper/staking')
const { sumTokensExport } = require('../helper/unwrapLPs')

const owner = '0x335D87736b4693E5ED3e5C4f6C737A5a87aFA029' // vault address
const token = '0x23CbB9F0de3258DE03baaD2BCeA4FCCC55233af0' // MINER

module.exports = {
    misrepresentedTokens: true,
    ethereum: {
        tvl: sumTokensExport({ owner, token }),
    },
    base: {
        tvl: sumTokensExport({
            owner: '0x335D87736b4693E5ED3e5C4f6C737A5a87aFA029',
            token: '0x18A8BD1fe17A1BB9FFB39eCD83E9489cfD17a022',
        }),
    },
}

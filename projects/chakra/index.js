const {sumTokensExport} = require("../helper/sumTokens");
const sdk = require("@defillama/sdk");

const addressBook = ['bc1pnn0znqk957s8muzfm784mp7l3eraj8vlqhtddudgh3fsy0f4g99qy5j8tx', 'bc1puc8qnmd44y4kpgwpxpy2l28n6pxh6fl47eeh9g99yv00rc30g3csjs0cu8', 'bc1pkaty5rtt2uf35sw3daa59s9y8vtrvlxv3rcm06ggjwee5x57fgxsp4m696']

module.exports = {
    // methodology: `Total amount of BTC in ${bitcoinAddressBook.chakra.join(", ")}. Restaked on babylon`,
    doublecounted: true,
    bitcoin: {tvl: sdk.util.sumChainTvls([sumTokensExport({owners: addressBook})])},
};

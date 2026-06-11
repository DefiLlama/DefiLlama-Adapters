const { sumTokensExport } = require('../helper/solana')

module.exports = {
    methodology: "Tracks all COOK locked in the solana bridge.",
    solana: { tvl: sumTokensExport({owner: 'DoYYCtcG2vfrE3HtxBBXiNVieMutvWBXsgbF3SKtYCyx', tokens: ['36ZrtQoab5MhhySaP1YSTwUahSk6GRVUTtZ6cuVfm9e1']}) }
}
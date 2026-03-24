const { treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
    solana: {
        owners: [
            'Gx4MBPb1vqZLJajZmsKLg8fGw9ErhoKsR8LeKcCKFyak',  // Pyth DAO Treasury
            'GAdn7TZhszf5KTfwNRx3A2nP6KCRFEWucZubgdEqbJA2',  // Pythian Council Ops Multisig
            'CUVeiL7SMWHfNNUKN9nF3DqrQrTwZaBNRN7uUNRcuEgn',  // Jupiter DCA escrow (in-flight buyback funds)
        ],
    },
})
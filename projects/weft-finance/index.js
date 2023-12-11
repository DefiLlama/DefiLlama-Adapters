const { sumTokensExport, } = require('../helper/chain/radixdlt');

module.exports = {
    radixdlt: {
        tvl: sumTokensExport({
            owners: [
                'component_rdx1cpuzsp2aqkjzg504s8h8hxg57wnaqpcp9r802jjcly5x3j5nape40l',
                'component_rdx1cq8mm5z49x6lyet44a0jd7zq52flrmykwwxszq65uzfn6pk3mvm0k4',
                'component_rdx1cq7qd9vnmmu5sjlnarye09rwep2fhnq9ghj6eafj6tj08y7358z5pu'
            ],
        })
    },
}

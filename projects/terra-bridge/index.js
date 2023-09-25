const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  methodology: "Sums tokens that are bridged (minted) to other chains via Terra Bridge (shuttle).",
  terra: {
    tvl: sumTokensExport({
      owners: [
        'terra13yxhrk08qvdf5zdc9ss5mwsg5sf7zva9xrgwgc',
        'terra1g6llg3zed35nd3mh9zx6n64tfw3z67w2c48tn2',
        'terra1rtn03a9l3qsc0a9verxwj00afs93mlm0yr7chk',
      ]
    })
  },
  hallmarks: [
    [1651881600, "UST depeg"],
  ],
};

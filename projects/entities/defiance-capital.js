const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x7E4B4DC22111B84594d9b7707A8DCFFd793D477A",
        "0xE97eb050Fa3e677e79E4ebEe7EF9c9c7D026377D",
        "0x1E138759baED8a1139376a475Bf7f08053ACA016",
        "0xdD709cAE362972cb3B92DCeaD77127f7b8D58202",
        "0x9B5ea8C719e29A5bd0959FaF79C9E5c8206d0499"

    ],
  },
  arbitrum: {
    owners: [
        "0x7E4B4DC22111B84594d9b7707A8DCFFd793D477A",
    ],
  },
  avax: {
    owners: [
        "0x7E4B4DC22111B84594d9b7707A8DCFFd793D477A",
    ],
  },
  bsc: {
    owners: [
        "0x7E4B4DC22111B84594d9b7707A8DCFFd793D477A",
        "0xdD709cAE362972cb3B92DCeaD77127f7b8D58202"
    ],
  },
}

module.exports = treasuryExports(config)
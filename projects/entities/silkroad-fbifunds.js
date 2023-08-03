const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
        "bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6", //https://www.reddit.com/r/CryptoCurrency/comments/li1fw7/btc_silkroad_stash_seized_nov_2020_by_the_feds/
        'bc1qmxjefnuy06v345v6vhwpwt05dztztmx4g3y7wp',
        'bc1qf2yvj48mzkj7uf8lc2a9sa7w983qe256l5c8fs',
        'bc1qe7nk2nlnjewghgw4sgm0r89zkjzsurda7z4rdg'
    ],
  },
}

module.exports = cexExports(config)
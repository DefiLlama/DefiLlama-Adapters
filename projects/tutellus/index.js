const { staking } = require('../helper/staking')

module.exports = {
  polygon: {
    tvl: () => ({}),
    staking: staking('0xc7963fb87c365f67247f97d329d50b9ec5a374b8', '0x12a34A6759c871C4C1E8A0A42CFc97e4D7Aaf68d'),
  },
  timetravel: false,
  methodology: "Counts the number of TUT tokens locked in Tutellus contracts.",
}


const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x598Dbe6738E0AcA4eAbc22feD2Ac737dbd13Fb8F",
        "0x3744DA57184575064838BBc87A0FC791F5E39eA2",
        "0x702caCafA54B88e9c54449563Fb2e496e85c78b7"

    ],
  },
}

module.exports = treasuryExports(config)
const { nullAddress, treasuryExports } = require("../helper/treasury");


const TIME = "0xb54f16fb19478766a268f172c9480f8da1a7c9c3"

module.exports = treasuryExports({
  ethereum: {
    tokens: [nullAddress, "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"], //LUSD AND USDC
    owners: [
      '0x355D72Fb52AD4591B2066E43e89A7A38CF5cb341'
    ],
  },
})

//they also are using different DEFI protocols
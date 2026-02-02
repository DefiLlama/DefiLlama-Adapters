const { sumERC4626VaultsExport2 } = require("../helper/erc4626");

module.exports = {
  methodology:
    'Calls totalAssets() on the RockSolid rock.rETH and rock.loopedETH vaults to get the total amount of rETH and ETH managed by the vaults.',
  start: 1756339201, //  vault launch timestamp
  ethereum: {
    tvl: sumERC4626VaultsExport2({
      vaults: [
        '0x936facdf10c8c36294e7b9d28345255539d81bc7', // RockSolid rock.rETH
        '0x7a12D4B719F5aA479eCD60dEfED909fb2A37e428', // RockSolid rock.loopedETH
      ],
    }),
  },
}

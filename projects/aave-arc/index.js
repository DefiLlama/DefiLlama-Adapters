const { aaveExports } = require('../helper/aave');

// The aaveExports function is used to export the TVL and borrowed values for the specified Aave protocol.
module.exports = {
    // The ethereum property contains the TVL and borrowed values for the Ethereum network.
    ethereum: aaveExports("ethereum", "0x6FdfafB66d39cD72CFE7984D3Bbcc76632faAb00", id=>id, ["0x71B53fC437cCD988b1b89B1D4605c3c3d0C810ea"]),
    // The methodology property explains how the TVL is calculated.
    methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending."
};

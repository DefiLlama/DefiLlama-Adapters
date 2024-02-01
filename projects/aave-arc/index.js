const { aaveExports } = require('../helper/aave');

// start block: 13431423
module.exports = {
    ethereum: aaveExports("ethereum", "0x6FdfafB66d39cD72CFE7984D3Bbcc76632faAb00", id=>id, ["0x71B53fC437cCD988b1b89B1D4605c3c3d0C810ea"]),
};
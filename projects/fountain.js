const ADDRESSES = require('./helper/coreAssets.json')
const { compoundExports } = require("./helper/compound");

module.exports = {
        oasis: {
        ...compoundExports(
            '0xA7684aE7e07Dac91113900342b3ef25B9Fd1D841',
            'oasis',
            '0xD7d588bAbFb99E82Cd6dd0cA7677A5599AA678B5',
            ADDRESSES.oasis.wROSE,
            )
    },
}; // node test.js projects/fountain.js
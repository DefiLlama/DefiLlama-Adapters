const { compoundExports } = require("./helper/compound");
const { transformOasisAddressBase } = require('./helper/portedTokens')

module.exports = {
    timetravel: true,
    aurora: {
        ...compoundExports(
            '0xA7684aE7e07Dac91113900342b3ef25B9Fd1D841',
            'oasis',
            '0xD7d588bAbFb99E82Cd6dd0cA7677A5599AA678B5',
            '0x21C718C22D52d0F3a789b752D4c2fD5908a8A733',
            transformOasisAddressBase,
            )
    },
}; // node test.js projects/fountain.js
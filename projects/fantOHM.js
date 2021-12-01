const { ohmTvl } = require('./helper/ohm');

const transforms = {
    "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e": "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
    "0xbb29d2a58d880af8aa5859e30470134deaf84f2b": "0x090185f2135308bad17527004364ebcc2d37e5f6", // sSPELL => SPELL
}

module.exports=ohmTvl("0xA3b52d5A6d2f8932a5cD921e09DA840092349D71", 
    [
        ["0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", false], // DAI
        ["0x82f0b8b456c1a451378467398982d4834b6829c1", false], // MIM
        ["0xbB29D2A58d880Af8AA5859e30470134dEAf84F2B", false], // sSPELL
        ["0xd77fc9c4074b56ecf80009744391942fbfddd88b", true], // DAI/FHM
        ["0x46622913cE40c54Ec14857f72968d4BAAF963947", true] // MIM/FHM
    ], 
    "fantom", 
    "0x068e87aa1eabebbad65378ede4b5c16e75e5a671", 
    "0xfa1fbb8ef55a4855e5688c0ee13ac3f202486286", 
    addr => (transforms[addr.toLowerCase()] ? transforms[addr.toLowerCase()] : `fantom:${addr}`) ,
    undefined, 
    true
);
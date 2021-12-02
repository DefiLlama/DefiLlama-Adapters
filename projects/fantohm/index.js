const { ohmTvl } = require('../helper/ohm')

const treasury = "0xA3b52d5A6d2f8932a5cD921e09DA840092349D71"
module.exports = ohmTvl(treasury, [
    //DAI
    ["0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", false],
    //MIM
    ["0x82f0b8b456c1a451378467398982d4834b6829c1", false],
    //sSPELL
    //["0xbB29D2A58d880Af8AA5859e30470134dEAf84F2B", false]
    //spooky LP
    ["0x46622913ce40c54ec14857f72968d4baaf963947", true],
    //spooky LP
    ["0xd77fc9c4074b56ecf80009744391942fbfddd88b", true],
   ], "fantom", "0xcb9297425C889A7CbBaa5d3DB97bAb4Ea54829c2", "0xfa1FBb8Ef55A4855E5688C0eE13aC3f202486286")
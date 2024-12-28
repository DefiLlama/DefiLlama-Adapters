const { compoundExports2 } = require('../helper/compound');

module.exports = {
    optimism: compoundExports2({
        comptroller: '0x505E91a70aA5036677A71b2Af8D1881B85181EAE',
        cether: '0x736440033C4C1C8A21e0B238989FE24bEC502014',
    }),
    base: compoundExports2({
        comptroller: '0x70Ee857E659806D9c19431b0dF96D813Bc98321b',
        cether: '0x6283829589A6A02981B425fd2e86D22F012191aC',
    })
}; 

module.exports.deadFrom='2023-09-08',
module.exports.optimism.borrowed = () => ({}) // bad debt
module.exports.base.borrowed = () => ({}) // bad debt

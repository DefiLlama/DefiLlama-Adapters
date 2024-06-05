const { compoundExports2 } = require('../helper/compound')

const config = {
  kcc: { comptroller: '0x337d8719f70D514367aBe780F7c1eAd1c0113Bc7', cether: '0x309f1639018e8b272126c4b99af442aa25dcd1f2' },
  era: { comptroller: '0x599bb9202EE2D2F95EDe9f88F622854f7ef2c371', cether: '0x9dae6c8c431ffc6d21b836e0d8d113e8365defb9' },
  blast: { comptroller: '0x1DD821C9E27fB2399DAb75AedB113c80C755DCa6', cether: '0xd9fcbd7b60966d013a28ff87925f75bb49e9b5ee' },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = compoundExports2(config[chain])
})

module.exports.kcc.borrowed = () => ({})
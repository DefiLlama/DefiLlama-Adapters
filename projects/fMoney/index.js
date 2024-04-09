
const { compoundExports2 } = require('../helper/compound')
const { sumBalancerLps } = require('../helper/unwrapLPs')

const addresses = {
  beetsVault: "0x8166994d9ebBe5829EC86Bd81258149B87faCfd3",
  fuBUX: "0xcf211d1022f0B1aEC7CbAdCa1472fc20E6dFe3c6",
  fBUX80lzUSDC20: "0x2ddcd6916ee7ccc6300cb0fe2919a341be0ee8bb"
}

async function staking(api) {  
  return sumBalancerLps({}, [[addresses.fBUX80lzUSDC20, addresses.beetsVault]], 0, 0, undefined, api)  
}

const config = {
	fantom: '0xB911d8064c0AA338241f349eD802Ad4bae6ec034',
}


Object.keys(config).forEach(chain => {
	module.exports[chain] = compoundExports2({ comptroller: config[chain] })
});

module.exports.fantom.staking = staking
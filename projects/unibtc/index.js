const { nullAddress } = require("../helper/tokenMapping");

const uniBTCAddresses = new Map();

uniBTCAddresses.set('bsquared', '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e');
uniBTCAddresses.set('bitlayer', '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e');
uniBTCAddresses.set('merlin', '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e');
uniBTCAddresses.set('ethereum', '0x004E9C3EF86bc1ca1f0bB5C7662861Ee93350568');
uniBTCAddresses.set('mantle', '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e');
uniBTCAddresses.set('optimism', '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e');


function chainTvl(chain) {
  return async (api) => {
    const totalSupply = await api.call({
      abi: 'erc20:totalSupply',
      target: uniBTCAddresses.get(chain),
    });

    api.add(nullAddress, totalSupply)
  }
}

module.exports = {
  bsquared: {
    tvl: chainTvl('bsquared'),
  },
  btr: {
    tvl: chainTvl('bitlayer'),
  },
  merlin: {
    tvl: chainTvl('merlin'),
  },
  ethereum: {
    tvl: chainTvl('ethereum'),
  },
  mantle: {
    tvl: chainTvl('mantle'),
  },
  optimism: {
    tvl: chainTvl('optimism'),
  }
};
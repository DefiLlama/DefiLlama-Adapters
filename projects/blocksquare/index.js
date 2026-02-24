const ADDRESSES = require('../helper/coreAssets.json');
const { getLogs2 } = require('../helper/cache/getLogs');

const PROPERTY_FACTORY = '0x1ae91a263a690bf2129cf0b3acac92bbb67e6685';
const PROPERTY_REGISTRY = '0x05325c1ab1440df7214db38f676f95999729267b';

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: PROPERTY_FACTORY,
    fromBlock: 12800000,
    eventAbi: 'event NewPropToken(address indexed certifiedPartner, address indexed proptoken, uint256 createdAt)',
  });

  const propertyTokens = logs.map((l) => l.proptoken);

  const valuations = await api.multiCall({
    target: PROPERTY_REGISTRY,
    abi: 'function getValuation(address property) view returns (uint256)',
    calls: propertyTokens,
    permitFailure: true,
  });

  valuations.forEach((v) => {
    if (v && BigInt(v) > 0n) {
      api.add(ADDRESSES.ethereum.DAI, v);
    }
  });
}

module.exports = {
  methodology: 'TVL is the sum of all tokenized real estate property valuations stored on-chain in the Blocksquare PropertyRegistry.',
  misrepresentedTokens: true,
  ethereum: {
    tvl,
  },
};

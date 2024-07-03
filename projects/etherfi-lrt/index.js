const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require('@defillama/sdk');

async function tvl(api) {
  const balETH2 = await api.call({
    abi: "uint256:totalSupply",
    target: '0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88',
  });
  api.add(ADDRESSES.ethereum.EETH, BigInt(balETH2));
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};

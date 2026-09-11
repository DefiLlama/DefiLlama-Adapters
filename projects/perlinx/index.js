const abi = {
  "poolCount": "uint256:poolCount",
  "arrayPerlinPools": "function arrayPerlinPools(uint256) view returns (address)",
  "poolIsListed": "function poolIsListed(address) view returns (bool)",
  "getCurrentTokens": "address[]:getCurrentTokens",
  "synthCount": "uint256:synthCount",
  "arraySynths": "function arraySynths(uint256) view returns (address)",
  "mapSynth_EMP": "function mapSynth_EMP(address) view returns (address)"
};

const perlinX = '0x5Fa19F612dfd39e6754Bb2E8300E681d1C589Dd4';
const perlErc20 = '0xeca82185adCE47f39c684352B0439f030f860318';

async function tvl(api) {
  const synths = await api.fetchList({ lengthAbi: abi.synthCount, itemAbi: abi.arraySynths, target: perlinX })
  const emps = await api.multiCall({ abi: abi.mapSynth_EMP, calls: synths, target: perlinX })
  return api.sumTokens({ owners: emps, token: perlErc20 })
}

module.exports = {
  start: '2020-09-24',
  ethereum: { tvl },
}

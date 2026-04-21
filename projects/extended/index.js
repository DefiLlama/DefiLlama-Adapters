const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const { sumTokens } = require('../helper/chain/starknet')

const ethContracts = [
  '0x1cE5D7f52A8aBd23551e91248151CA5A13353C65'
];

const starknetContracts = [
  '0x062da0780fae50d68cecaa5a051606dc21217ba290969b302db4dd99d2e9b470',
  '0x060c0f8cdfa28e8a3f719d1e2def2599785d7557a5650794c150d9b557603e48'
];

async function starknetTvl(api) {
  return sumTokens({ api, owners: starknetContracts, tokens: [ADDRESSES.starknet.USDC, ADDRESSES.starknet.USDC_CIRCLE] })
}

module.exports = {
  ethereum: { tvl: sumTokensExport({ owners: ethContracts, tokens: [ADDRESSES.ethereum.USDC] }) },
  starknet: { tvl: starknetTvl },
};

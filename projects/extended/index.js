const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const { sumTokens } = require('../helper/chain/starknet')

const ethContracts = [
  '0x1cE5D7f52A8aBd23551e91248151CA5A13353C65'
];

const starknetContract = '0x062da0780fae50d68cecaa5a051606dc21217ba290969b302db4dd99d2e9b470';

async function starknetTvl(api) {
  return sumTokens({ api, owner: starknetContract, tokens: [ADDRESSES.starknet.USDC, ADDRESSES.starknet.USDC_CIRCLE] })
}

module.exports = {
  ethereum: { tvl: sumTokensExport({ owners: ethContracts, tokens: [ADDRESSES.ethereum.USDC] }) },
  starknet: { tvl: starknetTvl },
};

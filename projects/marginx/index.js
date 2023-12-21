const { sumTokens } = require('../helper/chain/cosmos')
const { getConfig } = require('../helper/cache');
const bech32 = require('bech32');
const { ethers } = require("ethers");

const toChecksumAddress = (address) => {
	return ethers.utils.getAddress(address)
};

function bech32ToEthereum(bech32Address) {
  const { prefix, words } = bech32.decode(bech32Address);
  const data = bech32.fromWords(words);
  const hex = Buffer.from(data).toString('hex');
  const ethereumAddress = toChecksumAddress(`0x${hex}`);
  return ethereumAddress;
}

async function tvl(_, _b, _cb, { api, }) {
  const { data: chainInfo} = await getConfig('marginxConfig', 'https://api.marginx.io/settings/cross/chains')
  const owners = chainInfo.map(i => i.ibcAddress)
  return sumTokens({ chain: 'fxcore', owners })
  // const owners = chainInfo.map(i => bech32ToEthereum(i.ibcAddress))
  // return sumTokens2({ api, owners, tokens: [ADDRESSES.null, ADDRESSES.functionx.USDT], })
}

module.exports = {
  functionx: {
    tvl
  },
};

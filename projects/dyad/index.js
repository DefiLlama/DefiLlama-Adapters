const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");


async function tvl(_timestamp, block) {
    return {
      [ADDRESSES.null]: (
        await sdk.api.eth.getBalance({
          target: "0xdc400bbe0b8b79c07a962ea99a642f5819e3b712",
          block,
        })
      ).output,
    };
}

module.exports = {
  ethereum: {
    tvl,
  },
};




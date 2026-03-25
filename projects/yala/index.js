const bitcoinAddressBook = require("../helper/bitcoin-book/fetchers.js");
const helperBitcoin = require("../helper/chain/bitcoin");
const helperUnwrapLPs = require("../helper/unwrapLPs");
const { getConfig } = require("../helper/cache.js");

async function tvlInBitcoin() {
  return helperBitcoin.sumTokens({ owners:  await bitcoinAddressBook.yala() });
}

async function tvlInEthereum(api) {
  const res = await getConfig(
    "yala/ethereum",
    "https://raw.githubusercontent.com/yalaorg/yala-defillama/refs/heads/main/config.json"
  );

  // PSM
  {
    let tokensAndOwners = [];
    for (let i = 0; i < res.ethereum.PSM.addresses.length; i++) {
      const address = res.ethereum.PSM.addresses[i];
      const token = res.ethereum.PSM.tokens[i];
      tokensAndOwners.push([token, address]);
    }

    await helperUnwrapLPs.sumTokens2({
      api,
      tokensAndOwners,
      permitFailure: true,
    });
  }

  // AssetWrapper
  {
    let tokensAndOwners = [];
    for (let i = 0; i < res.ethereum.AssetWrapper.addresses.length; i++) {
      const address = res.ethereum.AssetWrapper.addresses[i];
      const token = res.ethereum.AssetWrapper.tokens[i];
      tokensAndOwners.push([token, address]);
    }

    await helperUnwrapLPs.sumTokens2({
      api,
      tokensAndOwners,
      permitFailure: true,
    });
  }
}

module.exports = {
  methodology:
    "The Yala Protocol allows users to lock Bitcoin as collateral to mint YU stablecoins. TVL is calculated by tracking the total supply of YBTC tokens (0x27A70B9F8073efE5A02998D5Cc64aCdc9e0Ba589), which represents Bitcoin locked in the protocol. The borrowed/stablecoin metric tracks the total supply of YU tokens (0xE868084cf08F3c3db11f4B73a95473762d9463f7), which represents the USD-pegged stablecoins minted against the Bitcoin collateral",
  start: "2025-05-16",
  bitcoin: {
    tvl: tvlInBitcoin,
  },
  ethereum: {
    tvl: tvlInEthereum,
  },
};

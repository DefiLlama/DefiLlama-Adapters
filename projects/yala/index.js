const helperBitcoin = require("../helper/chain/bitcoin");
const helperUnwrapLPs = require("../helper/unwrapLPs");
const helperSolana = require("../helper/solana");
const { getConfig } = require("../helper/cache.js");

async function tvlInBitcoin() {
  const res = await getConfig(
    "yala/bitcoin",
    "https://raw.githubusercontent.com/yalaorg/yala-defillama/refs/heads/main/config.json"
  );
  return helperBitcoin.sumTokens({ owners: res.bitcoin });
}

async function tvlInEthereum(api) {
  const res = await getConfig(
    "yala/ethereum",
    "https://raw.githubusercontent.com/yalaorg/yala-defillama/refs/heads/main/config.json"
  );

  // psm
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
}

async function borrowedInEthereum(api) {
  const res = await getConfig(
    "yala/ethereum",
    "https://raw.githubusercontent.com/yalaorg/yala-defillama/refs/heads/main/config.json"
  );
  const amt = await api.call({
    abi: "erc20:totalSupply",
    target: res.ethereum.YU,
  });

  api.addCGToken("usd", amt / 1e18);
}

async function borrowedInSolana(api) {
  const res = await getConfig(
    "yala/solana",
    "https://raw.githubusercontent.com/yalaorg/yala-defillama/refs/heads/main/config.json"
  );

  const ss = await helperSolana.getTokenSupplies([res.solana.YU]);
  const amt = ss[res.solana.YU];

  api.addCGToken("usd", amt / 1e6);
}

module.exports = {
  methodology:
    "The Yala Protocol allows users to lock Bitcoin as collateral to mint YU stablecoins. TVL is calculated by tracking the total supply of YBTC tokens (0x27A70B9F8073efE5A02998D5Cc64aCdc9e0Ba589), which represents Bitcoin locked in the protocol. The borrowed/stablecoin metric tracks the total supply of YU tokens (0xE868084cf08F3c3db11f4B73a95473762d9463f7), which represents the USD-pegged stablecoins minted against the Bitcoin collateral. Both token supplies are converted to their respective underlying asset values using CoinGecko price feeds.",
  start: "2025-05-16",
  bitcoin: {
    tvl: tvlInBitcoin,
  },
  ethereum: {
    tvl: tvlInEthereum,
    // borrowed: borrowedInEthereum,  // deprecated
  },
  // solana: {
  //   borrowed: borrowedInSolana,  // deprecated
  // },
};

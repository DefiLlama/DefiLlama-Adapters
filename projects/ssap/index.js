const { getBlock } = require("../helper/getBlock");
const { aaveChainTvl } = require("../helper/aave");
const { config } = require("@defillama/sdk/build/api");
const ethers = require("ethers");

config.setProvider(
  "clv",
  new ethers.providers.StaticJsonRpcProvider(
    "https://api-para.clover.finance",
    {
      name: "clv",
      chainId: 1024,
    }
  )
);

config.setProvider(
  "oasis",
  new ethers.providers.StaticJsonRpcProvider("https://emerald.oasis.dev", {
    name: "emerald",
    chainId: 42262,
  })
);

const addressMap = {
  "0xF91193A62879279d6b8f209f89b6418e3C0e5CBf":
    "bsc:0x55d398326f99059fF775485246999027B3197955",
  "0x4A52F069Cb00905d996A0d7B811D78e60b4cB09E":
    "bsc:0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  "0x1376C97C5c512d2d6F9173A9A3A016B6140b4536":
    "0x80C62FE4487E1351b47Ba49809EBD60ED085bf52",
  "0xA1c3767c93E7B51EcB445fDbae1494DfC654e524":
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "0x30bEBbC0b6b357945AC30660E025C1532B9C7804":
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8":
    "bsc:0x55d398326f99059fF775485246999027B3197955",
  "0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F":
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844":
    "bsc:0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  "0x21C718C22D52d0F3a789b752D4c2fD5908a8A733":
    "0x26b80fbfc01b71495f477d5237071242e0d959d7",
};

const decimalAdjust = {
  "bsc:0x55d398326f99059fF775485246999027B3197955": "000000000000",
  "bsc:0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d": "000000000000",
  "ethereum:0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "0000000000",
};

function lendingCLV(borrowed, registry, helper) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const chain = "clv";
    const block = await getBlock(timestamp, chain, chainBlocks, true);
    const balances = await aaveChainTvl(
      chain,
      registry,
      (addr) => addressMap[addr] || `clv:${addr}`,
      [helper],
      borrowed
    )(timestamp, ethBlock, {
      ...chainBlocks,
      clv: block,
    });
    Object.keys(balances).forEach((key) => {
      if (decimalAdjust[key]) {
        balances[key] = balances[key] + decimalAdjust[key];
      }
    });
    return balances;
  };
}

function lendingOasis(borrowed, registry, helper) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const chain = "oasis";
    const block = await getBlock(timestamp, chain, chainBlocks, true);
    const balances = await aaveChainTvl(
      chain,
      registry,
      (addr) => addressMap[addr] || `oasis:${addr}`,
      [helper],
      borrowed
    )(timestamp, ethBlock, {
      ...chainBlocks,
      clv: block,
    });
    Object.keys(balances).forEach((key) => {
      if (decimalAdjust[key]) {
        balances[key] = balances[key] + decimalAdjust[key];
      }
    });
    return balances;
  };
}

module.exports = {
  methodology:
    "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
  clv: {
    tvl: lendingCLV(
      false,
      "0x070CaAeac85CCaA7E8DCd88421904C2259Abed34",
      "0x49617386d6aAaA6aE23c0E7799B5c4F79f33f1B1"
    ),
    borrowed: lendingCLV(
      true,
      "0x070CaAeac85CCaA7E8DCd88421904C2259Abed34",
      "0x49617386d6aAaA6aE23c0E7799B5c4F79f33f1B1"
    ),
  },
  oasis: {
    tvl: lendingOasis(
      false,
      "0xBB4dfd53BA393DCD1AD1e30809C9527e9a00d522",
      "0x2b8DD6DE52F20EfA309BC56454b7A929B7a1E66D"
    ),
    borrowed: lendingOasis(
      true,
      "0xBB4dfd53BA393DCD1AD1e30809C9527e9a00d522",
      "0x2b8DD6DE52F20EfA309BC56454b7A929B7a1E66D"
    ),
  },
};

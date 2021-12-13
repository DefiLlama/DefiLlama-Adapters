const sdk = require("@defillama/sdk");

const abi = require("./abi.json");
const contracts = {
  ethereum: {
    DEPLOY_BLOCK: 10819469,
    GLOBAL_CONFIG_ADDRESS: "0xa13B12D2c2EC945bCAB381fb596481735E24D585",
    SAVINGS_ADDRESS: "0x7a9E457991352F8feFB90AB1ce7488DF7cDa6ed5",
    CETH: "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",
  },
  okexchain: {
    DEPLOY_BLOCK: 3674844,
    GLOBAL_CONFIG_ADDRESS: "0xAdD7b91FA4DC452A9C105F218236B28F17562555",
    SAVINGS_ADDRESS: "0xF3c87c005B04a07Dc014e1245f4Cff7A77b6697b",
    CETH: "0x621CE6596E0B9CcF635316BFE7FdBC80C3029Bec",
  },
};

const utility = {
  // get the latest TokenRegistry address through the GlobalConfig contract
  async getTokenRegistryAddressByGlobalConfig(block, chain) {
    return (
      await sdk.api.abi.call({
        block: block,
        chain: chain,
        target: contracts[chain].GLOBAL_CONFIG_ADDRESS,
        params: [],
        abi: abi["global:tokenInfoRegistry"],
      })
    ).output;
  },

  // Get the latest Bank address through the GlobalConfig contract
  async getBankAddressByGlobalConfig(block, chain) {
    return (
      await sdk.api.abi.call({
        block: block,
        chain: chain,
        target: contracts[chain].GLOBAL_CONFIG_ADDRESS,
        params: [],
        abi: abi["global:bank"],
      })
    ).output;
  },

  // Get the TokenRegistry contract
  async getTokenRegistryContract(block, ads, chain) {
    return (
      await sdk.api.abi.call({
        block: block,
        chain: chain,
        target: ads,
        params: [],
        abi: abi["tokenRegistry:getTokens"],
      })
    ).output;
  },

  // Get all tokens
  async getMarkets(block, chain) {
    // Get TokenRegistry Address
    let tokenRegistryAddress =
      await utility.getTokenRegistryAddressByGlobalConfig(block, chain);

    // Get latest markets
    let currentMarkets = await utility.getTokenRegistryContract(
      block,
      tokenRegistryAddress,
      chain
    );
    return currentMarkets;
  },

  async getBankPoolAmounts(block, markets, chain) {
    let bankAddress = await utility.getBankAddressByGlobalConfig(block, chain);
    let callsArray = [];
    markets.forEach((element) => {
      callsArray.push({
        target: bankAddress,
        params: element,
      });
    });
    return (
      await sdk.api.abi.multiCall({
        block: block,
        chain: chain,
        abi: abi["bank:getPoolAmount"],
        calls: callsArray,
      })
    ).output;
  },

  async getBankContractTokenState(block, markets, chain) {
    let bankAddress = await utility.getBankAddressByGlobalConfig(block, chain);
    let callsArray = [];
    markets.forEach((element) => {
      callsArray.push({
        target: bankAddress,
        params: element,
      });
    });
    return (
      await sdk.api.abi.multiCall({
        block: block,
        chain: chain,
        abi: abi["bank:getTokenState"],
        calls: callsArray,
      })
    ).output;
  },

  // Get Token Value
  async getCtokenValue(block, ctoken, chain) {
    let cEthToken = await sdk.api.abi.call({
      block: block,
      chain: chain,
      target: ctoken,
      params: contracts[chain].SAVINGS_ADDRESS,
      abi: "erc20:balanceOf",
    });
    return cEthToken.output;
  },

  // Get Symbol
  async getSymbol(block, markets) {
    let callsArray = [];

    markets.forEach((element) => {
      callsArray.push({
        target: element,
      });
    });
    return (
      await sdk.api.abi.multiCall({
        block: block,
        chain: chain,
        abi: "erc20:symbol",
        calls: callsArray,
      })
    ).output;
  },

  // Get cTokens
  async getCTokens(block, markets, chain) {
    let tokenRegistryAddress =
      await utility.getTokenRegistryAddressByGlobalConfig(block, chain);
    let callsArray = [];
    let allTokenObj = {};
    markets.forEach((token_address) => {
      allTokenObj[token_address] = "";
      callsArray.push({
        target: tokenRegistryAddress,
        params: token_address,
      });
    });
    let cToken = (
      await sdk.api.abi.multiCall({
        block: block,
        chain: chain,
        abi: abi["tokenRegistry:getCToken"],
        calls: callsArray,
      })
    ).output;

    let zeroCTokenAddress = "0x0000000000000000000000000000000000000000";
    cToken.forEach((item) => {
        allTokenObj[item.input.params[0]] =
          item.output === zeroCTokenAddress ? "" : item.output;
    });
    return allTokenObj;
  },
  //
};

async function ethereumTvl(timestamp, blockETH, chainBlocks) {
  const block = blockETH;
  const chain = "ethereum";
  return await getTvlByChain(timestamp, block, chain);
}
async function okexchainTvl(timestamp, blockETH, chainBlocks) {
  const block = chainBlocks["okexchain"];
  const chain = "okexchain";
  return await getTvlByChain(timestamp, block, chain);
}
async function getTvlByChain(timestamp, block, chain) {
  let config = contracts[chain];

  let balances = {};
  let networkAddressSymbol = chain === "ethereum" ? "" : `${chain}:`;
  if (!block || block > config.DEPLOY_BLOCK) {
    // Get all Tokens in the market
    let markets = await utility.getMarkets(block, chain);

    // Get Bank
    let banksPoolAmounts = await utility.getBankPoolAmounts(
      block,
      markets,
      chain
    );
    banksPoolAmounts.forEach((result) => {
        balances[networkAddressSymbol + result.input.params] = result.output;
    });

    // cETH value
    balances[networkAddressSymbol + config.CETH] = await utility.getCtokenValue(
      block,
      config.CETH,
      chain
    );
  }
  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethereumTvl,
  },
  okexchain: {
    tvl: okexchainTvl,
  },
};

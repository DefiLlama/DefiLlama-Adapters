const sdk = require("@defillama/sdk");
const { VAULT_ETF_ABI, VAULT_FACTORY_ABI, VAULT_PROFIT_TOKEN_ABI } = require("./abi");
const { sumTokens2 } = require("../helper/unwrapLPs");

const factory = {
  fantom: '0x9b7e30644a9b37eebaa7158129b03f5a3088659d',
  pulse: '0xac297968c97ef5686c79640960d106f65c307a37',
  base: '0x714c94b9820d7d73e61510e4c18b91f995a895c1',
  optimism: '0xd4f1a99212e5be72426bde45abadef66d7d6edf3',
  manta: '0x714c94b9820d7d73e61510e4c18b91f995a895c1',
  arbitrum: '0xe31fceaf93667365ce1e9edad3bed4a7dd0fc01a',
  avax: '0x6b714e6296b8b977e1d5ecb595197649e10a3db1',
  bsc: '0x3ace08b10b5c08a17d1c46277d65c81249e65f44',
}

const blackListTokens = [
  '0x6386704cd6f7a584ea9d23ccca66af7eba5a727e',
  '0xaa2c47a35c1298795b5271490971ec4874c8e53d',
  '0x6da9ebd271a0676f39c088a2b5fd849d5080c0af',
  '0x4117ec0a779448872d3820f37ba2060ae0b7c34b',
];

async function tvl(api) {
  const { chain } = api;
  const amount = await sdk.api.abi.call({
    target: factory[chain],
    abi: VAULT_FACTORY_ABI.profitTokensWhitelistCount,
    chain: chain,
    params: []
  });
  const profitTokenIndicies = new Array(Number(amount.output)).fill(0).map((_, index) => index);
  const profitTokens = await Promise.all(profitTokenIndicies.map(async (index) => {
    const profitToken = await sdk.api.abi.call({
      target: factory[chain],
      abi: VAULT_FACTORY_ABI.profitTokensWhitelist,
      chain: chain,
      params: [index]
    });
    return profitToken.output;
  }));
  const connectors = await Promise.all(profitTokens.map(async (profitToken) => {
    const connector = await sdk.api.abi.call({
      target: factory[chain],
      abi: VAULT_FACTORY_ABI.profitTokenConnector,
      chain: chain,
      params: [profitToken]
    });
    return connector.output;
  }))
  const underlyings = await Promise.all(connectors.map(async (connector) => {
    const underlying = await sdk.api.abi.call({
      target: connector,
      abi: VAULT_PROFIT_TOKEN_ABI.underlying,
      chain: chain,
    });
    return underlying.output;
  }));
  const filteredUnderlyings = underlyings.filter((address) => !blackListTokens.includes(address.toLowerCase()))
  const tokensCount = await Promise.all(filteredUnderlyings.map(async (underlying) => {
    const count = await sdk.api.abi.call({
      target: underlying,
      abi: VAULT_ETF_ABI.tokensCount,
      chain: chain,
    });
    return count.output;
  }))
  const tokens = (await Promise.all(tokensCount.map(async (tokenCount, index) => {
    const underlying = filteredUnderlyings[index];
    const amount = new Array(Number(tokenCount)).fill(0).map((_, index) => index);
    return Promise.all(amount.map(async (i) => {
      const count = await sdk.api.abi.call({
        target: underlying,
        abi: VAULT_ETF_ABI.tokens,
        chain: chain,
        params: i
      });
      return count.output;
    }))
  }))).flat();
  const balances = await sumTokens2({ chain, tokens, owners: filteredUnderlyings });
  return balances;
}

Object.keys(factory).forEach(chain => {
  module.exports[chain] = {
    tvl
  }
})
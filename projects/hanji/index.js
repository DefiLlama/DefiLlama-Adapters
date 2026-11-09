const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  // etlk RPCs cap getLogs at 500 blocks: markets and their creation block copied from factory logs, last created 2026-01-05
  etlk: {
    lobs: [
      ['0xD0BC067CF877F7b76CeB331891331d9e6ACda1a7', '0xc9B53AB2679f573e480d01e0f49e2B5CFB7a3EAb', '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', 6610834],
      ['0xbB6B01D94E3f6Ebae8647cB56D544f57928aB758', '0xbFc94CD2B1E55999Cfc7347a9313e88702B83d0F', '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', 6610835],
      ['0x65eA4dD7f789C71C0f57Ed84b3BDC3062898D3CB', '0xfc24f770F94edBca6D6f885E12d4317320BcB401', '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', 6610836],
      ['0x5aEf9c0EFF754A81A1fC98ec14e403E7C778Fece', '0xecAc9C5F704e954931349Da37F60E39f515c11c1', '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', 19152118],
      ['0x08978fc9dE5db58461b064F3591a3A2C67F69967', '0x01F07f4d78d47A64F4C3B2b65f513f15Be6E1854', '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', 23002438],
      ['0x7e60F9C49E14CF51F3C7B22890726042e7986686', '0xBC75197C123716CA2DA6B78116A3B2cCc7399c74', '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', 27988463],
      ['0x6CD22a6B64Cc6Fd1D05461ccbeE43364B8335F85', '0xBC75197C123716CA2DA6B78116A3B2cCc7399c74', '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', 28083242],
      ['0xec15d9D316745EbcEDAf37E0137678AA20FD5234', '0x79052Ab3C166D4899a1e0DD033aC3b379AF0B1fD', '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', 28083789],
      ['0x718a121fcEb293f4098D683Fd4Bda1025e55CE85', '0xc9B53AB2679f573e480d01e0f49e2B5CFB7a3EAb', '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', 35459006],
      ['0x3B604a2f552E7f3ceB32Ba2FbC6C4079Fe1A0D1c', '0xfc24f770F94edBca6D6f885E12d4317320BcB401', '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', 35459013],
      ['0x497da674449eBA478e499b295c6B9b4DcF2ADA4c', '0xbFc94CD2B1E55999Cfc7347a9313e88702B83d0F', '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', 35459016],
      ['0x94d717f2f0077c13B3C2C44e890E23cC78884990', '0xbFc94CD2B1E55999Cfc7347a9313e88702B83d0F', '0xc9B53AB2679f573e480d01e0f49e2B5CFB7a3EAb', 35459023],
      ['0x81F828742cDf142198e1c64C50d42594949e2A16', '0xc9B53AB2679f573e480d01e0f49e2B5CFB7a3EAb', '0xfc24f770F94edBca6D6f885E12d4317320BcB401', 35459027],
      ['0xED05D08414739D28E90Ec4d6f3A5D9eeB9bB6E0C', '0xecAc9C5F704e954931349Da37F60E39f515c11c1', '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', 35459035],
      ['0x43c234E5F9a41c63Ee5b79F95E353073AC4C55D6', '0x2C03058C8AFC06713be23e58D2febC8337dbfE6A', '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', 35459039],
      ['0xe21035DbBf168B92C52987DCd610FAc75f5a9103', '0xecAc9C5F704e954931349Da37F60E39f515c11c1', '0xbFc94CD2B1E55999Cfc7347a9313e88702B83d0F', 35459046],
    ],
    lpManagers: [
      ['0x4C911bf7A008C497719CBEb1a376f1cEc9e2c1d6', 7059597],
      ['0x4f2210992209Ad0aB0c8644547Bf0379B96Ed1F4', 13455521],
      ['0xEc24EAd8022190509992275559b57e7ED3C95E66', 13515321],
      ['0xB8e5e6519277BF3C961684b47313A3553cb0dD46', 13515560],
      ['0xB50221737075e28f44123A5bb89eaEA285722318', 13515944],
      ['0xB99334d510BC5c7B058c1f454CC1EbDB07C444f0', 35459055],
    ],
  },
  base: {
    lobsConfigs: [
      {
        factory: '0xC7264dB7c78Dd418632B73A415595c7930A9EEA4',
        fromBlock: 37860153
      }
    ],
    vaultConfigs: [
      {
        factory: '0xA73d880193a96B1c1917680DE7b9B8225E717569',
        fromBlock: 37860177
      }
    ],
  },
  monad: {
    lobsConfigs: [
      {
        factory: '0x5C28a12C8EbAF8524A2Ba1fdc62565571Aec87f1',
        fromBlock: 38411390
      }
    ],
    vaultConfigs: [
      {
        factory: '0xcAAE28d9e26fD11178762E81C46853Ae096c1500',
        fromBlock: 38412016
      }
    ],
  },
};

const createdLOBEventAbi = "event OnchainCLOBCreated(address indexed creator, address OnchainCLOB, address tokenXAddress, address tokenYAddress, bool supports_native_eth, uint256 scaling_token_x, uint256 scaling_token_y, address administrator, address marketmaker, address pauser, bool should_invoke_on_trade, uint64 admin_commission_rate, uint64 total_aggressive_commission_rate, uint64 total_passive_commission_rate, uint64 passive_order_payout)"
const createdVaultEventAbi = "event LPManagerCreated(address indexed creator, address lpManager, address lpManagerImplementation, address liquidityToken)"

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: async (api) => {
    const { lobs = [], lpManagers: staticLpManagers = [], lobsConfigs = [], vaultConfigs = [] } = config[chain];
    const block = await api.getBlock();
    const ownerTokens = lobs.filter(([, , , createdAt]) => createdAt <= block).map(([lob, tokenX, tokenY]) => [[tokenX, tokenY], lob]);
    for (const { factory, fromBlock } of lobsConfigs) {
      const lobCreatedLogs = await getLogs2({ api, factory, eventAbi: createdLOBEventAbi, fromBlock, })
      ownerTokens.push(...lobCreatedLogs.map(log => [[log.tokenXAddress, log.tokenYAddress], log.OnchainCLOB]))
    }
    const lpManagers = staticLpManagers.filter(([, createdAt]) => createdAt <= block).map(([lpManager]) => lpManager);
    for (const { factory, fromBlock } of vaultConfigs) {
      const vaultCreatedLogs = await getLogs2({ api, factory, eventAbi: createdVaultEventAbi, fromBlock, })
      lpManagers.push(...vaultCreatedLogs.map(log => log.lpManager));
    }
    const tokenInfos = await api.fetchList({ lengthAbi: 'getTokensCount', itemAbi: "function tokens(uint256) view returns (address tokenAddress, bool isActive, uint16 targetWeight, uint16 lowerBoundWeight, uint16 upperBoundWeight, uint8 decimals, uint24 oracleConfRel, bytes32 oraclePriceId)", calls: lpManagers, groupedByInput: true, })
    lpManagers.forEach((lpManager, i) => {
      const tokens = tokenInfos[i].map(i => i.tokenAddress)
      ownerTokens.push([tokens, lpManager])
    })
    return api.sumTokens({ ownerTokens })
  } }  
});

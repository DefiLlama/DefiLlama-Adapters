const { getLogs2 } = require('../helper/cache/getLogs');
const { getUniqueAddresses } = require('../helper/tokenMapping');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { queryContract } = require("../helper/chain/cosmos");
const CORE_ASSETS = require('../helper/coreAssets.json');

module.exports = {
  methodology: 'Total amount of BTC and eligible assets restaked on SatLayer, or through partner vaults specific to SatLayer.',
};

// Addresses related to SatLayer
const consts = {
  ETHEREUM_FACTORY: "0x42a856dbEBB97AbC1269EAB32f3bb40C15102819",
  BNB_FACTORY: "0x42a856dbEBB97AbC1269EAB32f3bb40C15102819",
  BITLAYER_FACTORY: "0x2E3c78576735802eD94e52B7e71830e9E44a9a1C",
  BERACHAIN_FACTORY: "0x50198b5E1330753F167F6e0544e4C8aF829BC99d",
  BABYLON_GENESIS_CBABY_HUB: "bbn1tng5u7fls4lyg356zkh2g32e80a286m8p2n0hqugc5467n9y6nksamehyj",
  SUI_FACTORY: "0x25646e1cac13d6198e821aac7a94cbb74a8e49a2b3bed2ffd22346990811fcc6",
};

// TVL for EVM chains
const evmConfig = {
  ethereum: { factory: consts.ETHEREUM_FACTORY, fromBlock: 20564864 },
  bsc: { factory: consts.BNB_FACTORY, fromBlock: 42094094 },
  btr: { factory: consts.BITLAYER_FACTORY, fromBlock: 4532898 },
  berachain: { factory: consts.BERACHAIN_FACTORY, fromBlock: 262893 },
};

// TVL for Turtle Club Vaults
const turtleClub = {
  ethereum: [
    {
      tokenAddress: "0x004e9c3ef86bc1ca1f0bb5c7662861ee93350568", // uniBTC
      vaultAddresses: ["0x65939777a9dC5A370707bb6b44b1ad0BC9e2D8a4"], // SatLayer uniBTC
    },
    {
      tokenAddress: "0xd9d920aa40f578ab794426f5c90f6c731d159def", // xSolvBTC
      vaultAddresses: ["0x76f31800eFdE39A5f98189447c7a514d974f4364"], // SatLayer xSolvBTC
    },
  ],
};

Object.keys(evmConfig).forEach(chain => {
  const { factory, fromBlock } = evmConfig[chain];

  module.exports[chain] = {
    tvl: async (api) => {
      // Only Ethereum has Turtle Club vaults
      if (chain === 'ethereum') {
        for (const turtleClubVault of turtleClub['ethereum']) {
          const tokenBalance = await api.call({
            abi: 'erc20:balanceOf',
            target: turtleClubVault.tokenAddress,
            params: turtleClubVault.vaultAddresses,
          });
          api.add(turtleClubVault.tokenAddress, tokenBalance);
        }
      }

      const logs = await getLogs2({
        api,
        factory,
        eventAbi: "event CapChanged(address token, uint256 cap)",
        fromBlock,
      });

      const tokens = getUniqueAddresses(logs.map(log => log.token));
      return sumTokens2({ api, owner: factory, tokens });
    },
  };
});

// TVL for Babylon Genesis (Cosmos SDK)
module.exports['babylon'] = {
  tvl: async (api) => {
    const data = await queryContract({
      contract: consts.BABYLON_GENESIS_CBABY_HUB,
      chain: api.chain,
      data: { state: {} },
    });

    const total_native_token_balance =
      parseInt(data.total_staked_amount) + parseInt(data.unclaimed_unstaked_balance);

    const token = CORE_ASSETS.babylon.BABY;
    api.add(token, total_native_token_balance);
    return api.getBalances();
  },
};

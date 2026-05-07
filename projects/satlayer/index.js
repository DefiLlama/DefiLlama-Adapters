const { getLogs2 } = require("../helper/cache/getLogs");
const { getUniqueAddresses } = require("../helper/tokenMapping");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { queryContract } = require("../helper/chain/cosmos");
const sui = require("../helper/chain/sui");
const CORE_ASSETS = require("../helper/coreAssets.json");

// To test, run: node test.js projects/satlayer/index.js

module.exports = {
  methodology: "Total amount of BTC and eligible assets restaked on SatLayer, or through partner vaults specific to SatLayer.",
};

// Addresses related to SatLayer
const consts = {
  ETHEREUM_FACTORY: "0x42a856dbEBB97AbC1269EAB32f3bb40C15102819",
  ETHEREUM_SLAY_FACTORY: "0xf80361e9f6b5f75b3e9be82bd1b3c87938e773b0",
  BNB_FACTORY: "0x42a856dbEBB97AbC1269EAB32f3bb40C15102819",
  BITLAYER_FACTORY: "0x2E3c78576735802eD94e52B7e71830e9E44a9a1C",
  BERACHAIN_FACTORY: "0x50198b5E1330753F167F6e0544e4C8aF829BC99d",
  BOB_FACTORY: "0x32fD8E43114Fb0a292Ca3127EAF4D1D69739Fb83",
  TAC_FACTORY: "0x32fD8E43114Fb0a292Ca3127EAF4D1D69739Fb83",
  BABYLON_GENESIS_CBABY_HUB: "bbn1tng5u7fls4lyg356zkh2g32e80a286m8p2n0hqugc5467n9y6nksamehyj",
  SUI_FACTORY: "0x25646e1cac13d6198e821aac7a94cbb74a8e49a2b3bed2ffd22346990811fcc6",
  BASE_FACTORY: "0xb57752dDc2Ec2DEFE9eDBb1fdb99dB1ca9b0b9b3",

  SUI_VAULTS: [
    {
      token: "0x3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040::lbtc::LBTC",
      vault: "0x505ec475423b9d3adbad91e1ec20363d58a9f0f90536190c69f4699f1bb87cb1" // satLBTC
    },
    {
      token: "0x876a4b7bce8aeaef60464c11f4026903e9afacab79b9b142686158aa86560b50::xbtc::XBTC",
      vault: "0x4c550885133adbca1ef0c3d1fddac0a8496a9d8fa7bb52556e6cf60fe70bb1e8" // satXBTC
    },
    {
      token: "0xa03ab7eee2c8e97111977b77374eaf6324ba617e7027382228350db08469189e::ybtc::YBTC",
      vault: "0x828dcef43c2c0ecf3720d26136aab40e819688b96bad0e262fbaa3672110d2d9" // satYBTC.B
    }
  ]
};

// TVL for EVM chains
const evmConfig = {
  ethereum: { factory: consts.ETHEREUM_FACTORY, fromBlock: 20564864 },
  bsc: { factory: consts.BNB_FACTORY, fromBlock: 42094094 },
  btr: { factory: consts.BITLAYER_FACTORY, fromBlock: 4532898 },
  berachain: { factory: consts.BERACHAIN_FACTORY, fromBlock: 262893 },
  bob: { factory: consts.BOB_FACTORY, fromBlock: 17866931 },
  tac: { factory: consts.TAC_FACTORY, fromBlock: 2129845 },
  base: { factory: consts.BASE_FACTORY, fromBlock: 34752522 },
};

// TVL of additional SatLayer vaults
const vaults = {
  ethereum: [
    {
      tokenAddress: "0x004e9c3ef86bc1ca1f0bb5c7662861ee93350568", // uniBTC
      vaultAddresses: ["0x65939777a9dC5A370707bb6b44b1ad0BC9e2D8a4"], // SatLayer uniBTC for TAC
    },
    {
      tokenAddress: "0xd9d920aa40f578ab794426f5c90f6c731d159def", // xSolvBTC
      vaultAddresses: ["0x76f31800eFdE39A5f98189447c7a514d974f4364"], // SatLayer xSolvBTC for TAC
    },
    {
      tokenAddress: "0x51477A3002ee04B7542aDfe63ccdb50c00Ee5147", // SLAY
      vaultAddresses: ["0xf80361e9f6b5f75b3e9be82bd1b3c87938e773b0"], // 60d SLAY vault
    },
    {
      tokenAddress: "0x51477A3002ee04B7542aDfe63ccdb50c00Ee5147", // SLAY
      vaultAddresses: ["0xf80361e9f6b5f75b3e9be82bd1b3c87938e773b0"], // 30d SLAY vault
    }
  ],
};

// TVL of Sui
async function suiTVL() {

}

Object.keys(evmConfig).forEach(chain => {
  const { factory, fromBlock } = evmConfig[chain];

  module.exports[chain] = {
    tvl: async (api) => {
      if (chain === "ethereum") {
        // Additional vaults
        for (const vault of vaults['ethereum']) {
          const tokenBalance = await api.call({
            abi: 'erc20:balanceOf',
            target: vault.tokenAddress,
            params: vault.vaultAddresses,
          });
          api.add(vault.tokenAddress, tokenBalance);
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

// TVL for Sui
module.exports['sui'] = {
  tvl: async (api) => {
    const vaultIds = consts.SUI_VAULTS.map(v => v.vault);
    const vaults = await sui.getObjects(vaultIds);

    for (let i = 0; i < vaults.length; i++) {
      const vault = vaults[i];
      const token = consts.SUI_VAULTS[i].token;
      const balance = vault.fields.balance;
      api.add(token, balance);
    }
  }
};

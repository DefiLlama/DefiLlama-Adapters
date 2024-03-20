//import utils
const ADDRESSES = require("../helper/coreAssets.json");

const contractAbis = {
  readOraclePrice: {
    inputs: [],
    name: "read",
    outputs: [
      { internalType: "int224", name: "value", type: "int224" },
      { internalType: "uint32", name: "timestamp", type: "uint32" },
    ],
    stateMutability: "view",
    type: "function",
  }, //
  balanceOf: "function balanceOf(address) external view returns (uint256)",
};

module.exports = {
  misrepresentedTokens: true,

  ethereum: {
    tvl: async (api) => {
      const lendingMain = {
        eth: "0xdeF3AA48bad043e53207d359dcDFdE46F50b6C02", //ETH
      };
      await api.sumTokens({
        tokensAndOwners: [[ADDRESSES.ethereum.WETH, lendingMain.eth]],
      });
      // leverage users
      const ezETH = {
        vault: "0x32a0ce2bDfc37eE606aB905b4f9fC286049A774f",
        reStakingToken: "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110",
        oracle: "0x28c1576eb118f2Ccd02eF2e6Dbd732F5C8D2e86B", //Renzo
      };

      const weETH = {
        vault: "0x5e0a74cb0F74D57F9d69914575b972ba6A14e27c",
        reStakingToken: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
        oracle: "0x6869f88582D049B9968A0Ef7bFCA2609D5F0123B",
      };

      const rsETH = {
        vault: "0xEc69AaC84D3081aA6F4636C5DBD3D7C2c2F42a9C",
        reStakingToken: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7",
        oracle: "0x1250BbACBC9302D2C0B5F4E48cc9907a6C1Aa67D",
      };

      const ezETH1x = {
        vault: "0xa9A57D0824a613d181e0323b0cA85fBD4E27160B",
        reStakingToken: "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110",
        oracle: "0x28c1576eb118f2Ccd02eF2e6Dbd732F5C8D2e86B", //Renzo
      };

      const weETH1x = {
        vault: "0x9320AB04E319018842BD59e2817054d19850Abc0",
        reStakingToken: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
        oracle: "0x6869f88582D049B9968A0Ef7bFCA2609D5F0123B",
      };

      const rsETH1x = {
        vault: "0x15A692f5986e9B3cd0aF02D0f5c78A37CB120843",
        reStakingToken: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7",
        oracle: "0x1250BbACBC9302D2C0B5F4E48cc9907a6C1Aa67D",
      };

      const strategies = [ezETH, weETH, rsETH, ezETH1x, weETH1x, rsETH1x];

      for (const strategy of strategies) {
        const bal = await api.call({
          abi: contractAbis.balanceOf,
          target: strategy.reStakingToken,
          params: [strategy.vault],
        });

        const lrETHPriceInETH = await api.call({
          target: strategy.oracle,
          abi: contractAbis.readOraclePrice,
        });

        const balInETH = (bal * lrETHPriceInETH.value) / 1e18;

        api.add(ADDRESSES.ethereum.WETH, balInETH);
      }
    },
  },

  arbitrum: {
    tvl: async (api) => {
      //lending
      const lendingArb = {
        usdc_e: "0xa2e4cab1F6f9f1163bCe937517f1935BEc4a0A7c",
        usdt: "0xeb0b9B5FFb763dD69440565F63c67f9695B7C3dA",
        arb: "0x529f94bcd37896b6a38452497C62b2F0a8217517",
        wstETH: "0x521A8Ca3baF3d7677ddCC091eD91D969D4AfcfF8",
        eth: "0x97801654D2048E639043c77b16Bc906541B3490a",
        usdc: "0xd3E1BDe4b4163c86B9b7668dE8Ae7618720dCa93",
      };

      await api.sumTokens({
        tokensAndOwners: [
          [ADDRESSES.arbitrum.USDC, lendingArb.usdc_e],
          [ADDRESSES.arbitrum.USDT, lendingArb.usdt],
          [ADDRESSES.arbitrum.WSTETH, lendingArb.wstETH],
          [ADDRESSES.arbitrum.WETH, lendingArb.eth],
          [ADDRESSES.arbitrum.ARB, lendingArb.arb],
          [ADDRESSES.arbitrum.USDC_CIRCLE, lendingArb.usdc],
        ],
      });

      // leverage users
      const ezETH = {
        vault: "0x6295248F578bFA9c057a3e1182BED27121530E7A",
        reStakingToken: "0x2416092f143378750bb29b79eD961ab195CcEea5",
        oracle: "0x28c1576eb118f2Ccd02eF2e6Dbd732F5C8D2e86B", //Renzo
      };

      const weETH = {
        vault: "0xb8Cfb3406aBE78a2C836DCe69608e9cD80a78301",
        reStakingToken: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
        oracle: "0x6869f88582D049B9968A0Ef7bFCA2609D5F0123B",
      };

      const rsETH = {
        vault: "0x65E7C3C88806FF010BB197B2577cCddA9704fA2F",
        reStakingToken: "0x4186BFC76E2E237523CBC30FD220FE055156b41F",
        oracle: "0x1250BbACBC9302D2C0B5F4E48cc9907a6C1Aa67D",
      };

      const ezETH1x = {
        vault: "0x0bAc1a3D569c16D8AD9D3aB37f61dAF18DCfF781" /*vault*/,
        reStakingToken: "0x2416092f143378750bb29b79eD961ab195CcEea5" /*reStakingToken*/,
        oracle: "0x28c1576eb118f2Ccd02eF2e6Dbd732F5C8D2e86B" /*oracle*/,
      };
      const weETH1x = {
        vault: "0xF528B8EA22a17000e49a914658d7E0F7d982803e" /*vault*/,
        reStakingToken: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe" /*reStakingToken*/,
        oracle: "0x6869f88582D049B9968A0Ef7bFCA2609D5F0123B" /*oracle*/,
      };

      const rsETH1x = {
        vault: "0xe929BF8368171a76D4A828ee2cD4A50CcE31d203" /*vault*/,
        reStakingToken: "0x4186BFC76E2E237523CBC30FD220FE055156b41F" /*reStakingToken*/,
        oracle: "0x1250BbACBC9302D2C0B5F4E48cc9907a6C1Aa67D",
      };

      const strategies = [ezETH, weETH, rsETH, ezETH1x, weETH1x, rsETH1x];

      for (const strategy of strategies) {
        const bal = await api.call({
          abi: contractAbis.balanceOf,
          target: strategy.reStakingToken,
          params: [strategy.vault],
        });

        const lrETHPriceInETH = await api.call({
          target: strategy.oracle,
          abi: contractAbis.readOraclePrice,
        });

        const balInETH = (bal * lrETHPriceInETH.value) / 1e18;

        api.add(ADDRESSES.arbitrum.WETH, balInETH);
      }
    },
  },
};

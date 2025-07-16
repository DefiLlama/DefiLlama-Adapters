const ADDRESSES = require("../helper/coreAssets.json");

const WEETH_ADDRESS = {
  ethereum: ADDRESSES.ethereum.WEETH,
  arbitrum: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
  optimism: "0x346e03f8cce9fe01dcb3d0da3e9d00dc2c0e08f0",
  mode: ADDRESSES.blast.weETH,
  manta: "0x77b6F99970f488cFA8bd41892900b6Ce881C2300",
  blast: ADDRESSES.blast.weETH,
  linea: "0x1bf74c010e6320bab11e2e5a532b5ac15e0b8aa6",
  scroll: "0x01f0a31698c4d065659b9bdc21b3610292a1c506",
};

const CAP_ADDRESS = {
  ethereum: "0x451d791b6e9a9b8c9237bb55e58a7757342b16f9",
  arbitrum: "0xb883ee478d3b7fea8a5357a3c3e27e2d2292b1d2",
  optimism: "0xb883ee478d3b7fea8a5357a3c3e27e2d2292b1d2",
  mode: "0xb883ee478d3b7fea8a5357a3c3e27e2d2292b1d2",
  manta: "0xb883ee478d3b7fea8a5357a3c3e27e2d2292b1d2",
  blast: "0x096430ef0a653c067df32e93ff77090e084169de",
  linea: "0xcd32876b9b483eb75e8ca74935e4b51725f33a91",
  scroll: "0xcd32876b9B483eb75e8ca74935E4b51725F33A91",
};

const THEO_VAULT_ADDRESS = [
  {
    chainId: 1,
    address: "0x0b75e167f8a37179b7044414ee43e94cabeaa2fa",
  },
  {
    chainId: 42161,
    address: "0x54602e5cba09e01eee9b2050f1f4f0dc902cee34",
  },
  {
    chainId: 59144,
    address: "0xcf101e13b5181f79094b0726b03e89d1cb95b28c",
  },
];

const THEO_UNDERLYING_ASSETS = {
  "0x0b75e167f8a37179b7044414ee43e94cabeaa2fa": WEETH_ADDRESS.ethereum,
  "0x54602e5cba09e01eee9b2050f1f4f0dc902cee34": WEETH_ADDRESS.arbitrum,
  "0xcf101e13b5181f79094b0726b03e89d1cb95b28c": WEETH_ADDRESS.linea,
};

const MORPH_CHAIN_ID = 2818;

const MORPH_VAULTS_ADDRESS = [
  {
    chainId: MORPH_CHAIN_ID,
    address: "0xb9e83425cb9715b1f4d105f06ca43084bab86690",
  },
  {
    chainId: MORPH_CHAIN_ID,
    address: "0x073058aaeb22a1b09912526db7361fa11f23cc42",
  },
  {
    chainId: MORPH_CHAIN_ID,
    address: "0x2da0f5ff7504eba1cbb2b97f8531bd4852442e39",
  },
  {
    chainId: MORPH_CHAIN_ID,
    address: "0xae8afc08be496859a96f605b9dad5acd853b3cdd",
  },
];

const MORPH_UNDERLYING_ASSETS = {
  "0xb9e83425cb9715b1f4d105f06ca43084bab86690": ADDRESSES.morph.WETH,
  "0x073058aaeb22a1b09912526db7361fa11f23cc42": ADDRESSES.morph.USDT,
  "0x2da0f5ff7504eba1cbb2b97f8531bd4852442e39": ADDRESSES.morph.USDC,
  "0xae8afc08be496859a96f605b9dad5acd853b3cdd": ADDRESSES.morph.WBTC,
};

const chainTVL = ({ vaults = [] }) => async (api) => {
  const caps = [];
  if (CAP_ADDRESS[api.chain] && WEETH_ADDRESS[api.chain]) {
    caps.push({ cap: CAP_ADDRESS[api.chain], asset: WEETH_ADDRESS[api.chain] });
  }
  const capContracts = caps.map((i) => i.cap);
  const capTokens = caps.map((i) => i.asset);
  const capTokenBals = await api.multiCall({
    abi: "uint256:load",
    calls: capContracts,
  });
  api.add(capTokens, capTokenBals);

  const theoVaults = THEO_VAULT_ADDRESS.filter(
    (vault) => vault.chainId === api.chainId
  ).map((vault) => vault.address.toLowerCase());

  const regularVaults = vaults.filter(
    (vault) => !theoVaults.includes(vault.toLowerCase())
  );

  const vaultInfos = await api.multiCall({
    abi: "function vaultParams() view returns (uint8 decimals, address asset, uint56 minimumSupply, uint104 cap)",
    calls: regularVaults,
    permitFailure: true,
  });
  const vaultInfos2 = await api.multiCall({
    abi: "address:asset",
    calls: regularVaults,
    permitFailure: true,
  });
  const vaultTokens = vaultInfos.map((v, i) => v?.asset ?? vaultInfos2[i]);

  const balances = await api.sumTokens({
    tokensAndOwners2: [vaultTokens, regularVaults],
  });

  if (theoVaults.length > 0) {
    const theoTotalSupplies = await api.multiCall({
      abi: "uint256:totalSupply",
      calls: theoVaults,
    });

    theoVaults.forEach((theoVault, i) => {
      const underlyingAsset = THEO_UNDERLYING_ASSETS[theoVault];
      if (underlyingAsset) {
        api.add(underlyingAsset, theoTotalSupplies[i]);
      } else {
        api.add(theoVault, theoTotalSupplies[i]);
      }
    });
  }

  if (api.chainId === MORPH_CHAIN_ID && MORPH_VAULTS_ADDRESS.length > 0) {
    const morphTotalSupplies = await api.multiCall({
      abi: "uint256:totalSupply",
      calls: MORPH_VAULTS_ADDRESS.map((i) => i.address),
    });

    MORPH_VAULTS_ADDRESS.forEach((morphVault, i) => {
      const underlyingAsset = MORPH_UNDERLYING_ASSETS[morphVault.address];
      if (underlyingAsset) {
        api.add(underlyingAsset, morphTotalSupplies[i]);
      }
    });
  }

  return balances;
};

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: chainTVL({
      vaults: [
        "0xE4cf2D4eb9c01784798679F2FED4CF47cc59a3ec",
        "0x02Ff1F648Ff443B5d88214341F0acE6ECFb94cF3",
        "0xA1eBd23c4364e7491633237A0d9359D82c629182",
        "0x0109e9f292516dAB3E15EfC61811C5e5a7FA5358",
        "0x0B75e167F8A37179b7044414EE43e94cabeAA2FA",
      ],
    }),
  },
  scroll: {
    tvl: chainTVL({
      vaults: [
        "0xA0EeB418213f8472cba2c842378E1bB64e28bd28",
      ]
    }),
  },
  arbitrum: {
    tvl: chainTVL({
      vaults: [
        "0x7E8cffBe165c6905a8AceC0f37B341c00353e8BA",
        "0x73981B0496fC08e9136BAF74b79d32A4d4F2a007",
        "0xbEd575b0FeDa4F84b71144634693DaCc07749471",
        "0x54602E5cBa09e01EeE9B2050F1F4f0Dc902CeE34",
      ]
    }),
  },
  optimism: {
    tvl: chainTVL({
      vaults: [
        "0x5616Fe2762687Cd8a9158c27F62aff84E36821Be",
      ],
    }),
  },
  mode: {
    tvl: chainTVL({
      vaults: [
        "0xbEd575b0FeDa4F84b71144634693DaCc07749471",
      ],
    }),
  },
  manta: {
    tvl: chainTVL({
      vaults: [],
    }),
  },
  blast: {
    tvl: chainTVL({
      vaults: [
        "0x8506fD66FCeD711c11F9E837EcAEC0F87C3F60A0",
      ],
    }),
  },
  linea: {
    tvl: chainTVL({
      vaults: [
        "0x56ceD49205e5D9b4d8D9B29f4aBfbe7bb8b08768",
        "0x96d6cE4e83dB947fF6bD1Ab0B377F23cd5D9ec2D",
        "0xcF101e13b5181f79094B0726B03e89d1cB95b28C",
      ],
    }),
  },
  bsc: {
    tvl: chainTVL({
      vaults: ["0xaDd58517c5D45c8ed361986f193785F8Ed1ABFc2"],
    }),
  },
  mantle: {
    tvl: chainTVL({
      vaults: ["0x6FF000453a9c14f7d3bf381925c8cde565DbCe55"],
    }),
  },
  morph: {
    tvl: chainTVL({
      vaults: [],
    }),
  },
};
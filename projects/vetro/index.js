// Collateral Tokens (Ethereum Mainnet)
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const FRXUSD = "0xCAcd6fd266aF91b8AeD52aCCc382b4e165586E29";
const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const CBBTC = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";
const HEMIBTC = "0x06ea695B91700071B161A434fED42D1DcbAD9f00";

// Vetro Vault Contracts
const USDC_VAULT = "0xe3DA4B83C9dd4c4D185ecE42077462b3F35c454a";
const USDT_VAULT = "0x6d134cAAD0CA29Cd6ea145f6C0DC766076690547";
const FRXUSD_VAULT = "0xBd44B65cE2b7c736724E0AE7e008CE3Fb00697d8";
const WBTC_VAULT = "0x30c410D92e54B2b492D725D6CEBed98891817C91";
const CBBTC_VAULT = "0xD954d720885f8409bCBe3f15ad2fc3EcA4a5Ba33";
const HEMIBTC_VAULT = "0x54b8a87c9f85Dd2515CaAE1fad2dd85199900076";

// System Treasuries & Gateways
const VUSD_TREASURY = "0xC8317A10385BE07901A4c9ee3d06E1D83AE378c9";
const VUSD_GATEWAY = "0xDaD503f8B9d42bb7af3AfC588358D30163e4416F";
const VETBTC_TREASURY = "0xd25a7b0b817fD816d0995eC67fb70e75EE65Bd7F";
const VETBTC_GATEWAY = "0xCBA2Ffa0AC52d7871a4221a871793Eb788013faB";

// Vetro Staked Tokens & Vaults
const VUSD = "0xCa83DDE9c22254f58e771bE5E157773212AcBAc3";
const SVUSD_VAULT = "0x476310E34D2810f7d79C43A74E4D79405bd7a925";
const VETBTC = "0xf196C68233464A16CFDa319a47c21f4cECa62001";
const SVETBTC_VAULT = "0x0cB9D84d4bcEc8d3D5B2d99a6F07f4605325987e";

const vaults = [
  [USDC, USDC_VAULT],
  [USDT, USDT_VAULT],
  [FRXUSD, FRXUSD_VAULT],
  [WBTC, WBTC_VAULT],
  [CBBTC, CBBTC_VAULT],
  [HEMIBTC, HEMIBTC_VAULT],
];

async function tvl(api) {
  const vaultAddresses = vaults.map(([, vault]) => vault);

  // 1. Query totalAssets across all Vaults (Reserve Buffer + Deployed Strategies)
  const totalAssetsList = await api.multiCall({
    abi: "function totalAssets() view returns (uint256)",
    calls: vaultAddresses,
    permitFailure: true,
  });

  const failedVaults = [];

  vaults.forEach(([token, vault], i) => {
    if (totalAssetsList[i] && totalAssetsList[i] > 0) {
      api.add(token, totalAssetsList[i]);
    } else {
      failedVaults.push([token, vault]);
    }
  });

  // 2. Fallback ONLY for vaults where totalAssets() failed (e.g., cbBTC)
  if (failedVaults.length > 0) {
    const fallbackOwners = [
      ...failedVaults.map(([, vault]) => vault),
      VUSD_TREASURY,
      VUSD_GATEWAY,
      VETBTC_TREASURY,
      VETBTC_GATEWAY,
    ];
    await api.sumTokens({
      tokens: failedVaults.map(([token]) => token),
      owners: fallbackOwners,
    });
  }
}

async function staking(api) {
  return api.sumTokens({
    tokensAndOwners: [
      [VUSD, SVUSD_VAULT],
      [VETBTC, SVETBTC_VAULT],
    ],
  });
}

module.exports = {
  methodology:
    "TVL comprises backing collateral (USDC, USDT, frxUSD, WBTC, cbBTC, hemiBTC) managed by Vetro minter vaults, including reserve buffers and strategy allocations. Staking tracks VUSD and vetBTC locked in sVUSD and svetBTC vaults.",
  ethereum: {
    tvl,
    staking,
  },
};

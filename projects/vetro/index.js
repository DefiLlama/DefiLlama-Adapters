const VUSD_TREASURY = "0xC8317A10385BE07901A4c9ee3d06E1D83AE378c9";
const VETBTC_TREASURY = "0xd25a7b0b817fD816d0995eC67fb70e75EE65Bd7F";

const VUSD = "0xCa83DDE9c22254f58e771bE5E157773212AcBAc3";
const SVUSD_VAULT = "0x476310E34D2810f7d79C43A74E4D79405bd7a925";
const VETBTC = "0xf196C68233464A16CFDa319a47c21f4cECa62001";
const SVETBTC_VAULT = "0x0cB9D84d4bcEc8d3D5B2d99a6F07f4605325987e";

const treasuries = [VUSD_TREASURY, VETBTC_TREASURY];

async function tvl(api) {
  for (const treasury of treasuries) {
    // 1. Dynamically discover whitelisted collateral tokens from Treasury config
    const tokens = await api.call({
      target: treasury,
      abi: "function whitelistedTokens() view returns (address[])",
    });

    // 2. Fetch withdrawable balances (Treasury idle + Vault strategies) strictly
    const withdrawableBalances = await api.multiCall({
      target: treasury,
      abi: "function withdrawable(address) view returns (uint256)",
      calls: tokens,
    });

    tokens.forEach((token, i) => {
      api.add(token, withdrawableBalances[i]);
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
    "TVL dynamically discovers whitelisted collateral tokens from Vetro Treasuries and queries their total withdrawable balances (combining treasury idle funds and vault yield strategy allocations). Staking tracks VUSD and vetBTC locked in sVUSD and svetBTC vaults.",
  ethereum: {
    tvl,
    staking,
  },
};

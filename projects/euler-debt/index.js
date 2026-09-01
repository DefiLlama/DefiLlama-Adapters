const { sumTokens2 } = require("../helper/unwrapLPs");

const HYBRID_DEBT_MARKET = "0x555529fC9E50c10c0d090cB3f2D7a1d7dbCADB0B";

const VAULTS = {
  avax: [
    "0x6072A6d18446278bB5a43eb747de8F61e34cB77f",
    "0xa446938b0204Aa4055cdFEd68Ddf0E0d1BAB3E9E",
    "0x2137568666f12fc5A026f5430Ae7194F1C1362aB",
    "0x39dE0f00189306062D79eDEC6DcA5bb6bFd108f9",
    "0xABA9d2D4b6B93C3dc8976D8eb0690CCA56431FE4",
    "0xa4284e26Ae6469aeE8eC38Aa9Db96fc62d6315A1",
    "0xe91841F707936faf515ff6d478624A325A4f9199",
    "0x6fC9b3a52944A577cd8971Fd8fDE0819001bC595",
    "0x03ef14425CF0d7Af62Cdb8D6E0Acb0b0512aE35C",
  ],
  plasma: [
    "0xF675FBe777E992f5D5D84AdF41161dC0f20104a6",
    "0x57c582346B7d49A46Af3745A8278917D1c1311b8",
    "0x3799251bD81925cfcCF2992F10Af27A4e62Bf3F7",
    "0x27934d4879fc28a74703726eDae15F757E45A48a",
    "0xF90Cf999dE728A582e154F926876b70e93a747B7",
    "0xb5526491742FEe67E9E0D0D8c619A95D422fd398",
  ],
  ethereum: [
    "0x211711F277f146fC947D7053B41BB71BB5b5FC2C",
    "0x01864aE3c7d5f507cC4c24cA67B4CABbDdA37EcD",
    "0x038dd0Eb275B7DE3B07884f1Fa106eD6423C45F2",
  ],
  bsc: [
    "0x69A93DbAB609266af96f05658b2e22d020de2E19",
    "0xC41f2Ba7102e9F9F2d603eb951F955aE205ed272",
    "0x3ac88AfbC38Bb41443457eeB027b60e85B815538",
    "0xc4dB46B082B415c16C54c91c5750Df8e2f90EF36",
    "0x7a455f66FD2D2d5C69ae403a971ED513C852F9D7",
    "0x266D3F3219680624DE4D66c716444512A2B9a72F",
    "0x5d3b4bcff6a24A20a98070263D03D474586c9b29",
  ],
  sonic: [
    "0x196F3C7443E940911EE2Bb88e019Fd71400349D9",
    "0xa5cd24d9792F4F131f5976Af935A505D19c8Db2b",
    "0x9144C0F0614dD0acE859C61CC37e5386d2Ada43A",
    "0xB38D431e932fEa77d1dF0AE0dFE4400c97e597B8",
    "0xeeaaB5c863f4b1c5356aF138F384AdC25Cb70Da6",
    "0x0806af1762Bdd85B167825ab1a64E31CF9497038",
    "0x4c0AF5d6Bcb10B3C05FB5F3a846999a3d87534C7",
    "0x3D9e5462A940684073EED7e4a13d19AE0Dcd13bc",
    "0xeEb1DC1Ca7ffC5b54aD1cc4c1088Db4E5657Cb6c",
    "0x7aD07B280A17Ac7af489E487eaAf004b69786a0A",
    "0x8D024593d781B1C86EcD5d0f899d10C5E9de7069",
  ],
};

async function tvl(api) {
  const chain = api.chain;
  const vaults = VAULTS[chain];

  // Get underlying assets for each vault (ERC4626 standard)
  const underlyingAssets = await api.multiCall({
    abi: "address:asset",
    calls: vaults,
  });

  // Get vault token balances held in the contract
  const vaultBalances = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: vaults.map((vault) => ({ target: vault, params: [HYBRID_DEBT_MARKET] })),
  });

  // Convert vault balances to underlying asset amounts
  const assetAmounts = await api.multiCall({
    abi: "function convertToAssets(uint256) view returns (uint256)",
    calls: vaults.map((vault, i) => ({ target: vault, params: [vaultBalances[i]] })),
  });

  // Add converted vault amounts as underlying tokens
  assetAmounts.forEach((amount, i) => {
    if (amount > 0) {
      api.add(underlyingAssets[i], amount);
    }
  });

  // Also sum any underlying tokens held directly in the contract
  return sumTokens2({
    api,
    owner: HYBRID_DEBT_MARKET,
    tokens: underlyingAssets,
  });
}

module.exports = {
  methodology: "TVL is calculated by summing all ERC20 tokens locked in active orders on the HybridDebtMarket contract. Vault shares are converted to their underlying asset value.",
  avax: { tvl },
  plasma: { tvl },
  ethereum: { tvl },
  bsc: { tvl },
  sonic: { tvl },
};

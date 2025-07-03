const ADDRESSES = require('../helper/coreAssets.json')
const BERA_KODIAK_VAULTS = [
  {
    address: "0x40540b9CE95EBdbBcbfd88ceB40a183B20a57fd7",
    kodiakIsland: "0x564f011D557aAd1cA09BFC956Eb8a17C35d490e0",
    token0: ADDRESSES.berachain.WBERA,
    token1: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b"
  },
  {
    address: "0xB5D5c690802a24Be3EE08A5d6e243B9E9926d679",
    kodiakIsland: "0x98bDEEde9A45C28d229285d9d6e9139e9F505391",
    token0: "0x18878Df23e2a36f81e820e4b47b4A40576D3159C",
    token1: ADDRESSES.berachain.HONEY
  },
  {
    address: "0xd4A98C1e2E3907621867C21b16a465233B31f8b8",
    kodiakIsland: "0x337eF1eB6c8BBeD571170Fc2b468608ab9e2Aac8",
    token0: ADDRESSES.berachain.WBERA,
    token1: "0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe"
  },
  {
    address: "0x9488AC8D72A68b7225873c2aEbe31349c86E1Bfd",
    kodiakIsland: "0x24afcEB372b755F4953e738d6b38E9e4646D9F57",
    token0: "0x9b6761bf2397Bb5a6624a856cC84A3A14Dcd3fe5",
    token1: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b"
  },
  {
    address: "0x980f90BBf7992aB3b89F54140060d890a411aaAE",
    kodiakIsland: "0x5347e5133b22A680Ee94b7e62803E848F8d8C92e",
    token0: "0x7e768f47dfDD5DAe874Aac233f1Bc5817137E453",
    token1: "0x982940eBfC5caa2F5b5a82AAc2Dfa99F18BB7dA4"
  },
  {
    address: "0x585ad5BcD7cC28dAdb3BDd79782D14513171f760",
    kodiakIsland: "0x9f6cf7aCb2F16f7d906EeeCB0a6020a5Cf91A41d",
    token0: ADDRESSES.berachain.WBERA,
    token1: "0xf3530788DEB3d21E8fA2c3CBBF93317FB38a0D3C"
  },
]

const BULLA_VAULTS = [
  {
    address: "0xE5A5Cbc42aE849a3780Ec847184Fd9a7ae3F56A5",
    asset: "0xcfFBFD665BEdB19B47837461A5aBf4388C560D35",
    token0: ADDRESSES.berachain.WBERA,
    token1: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b"
  },
  // AquaBera vault uses same TVL calculation as bulla vaults
  {
    address: "0x978A2FfFB70F40Cf9d64755c80a49f177Ff95e18",
    asset: "0x04fD6a7B02E2e48caedaD7135420604de5f834f8",
    token0: ADDRESSES.berachain.WBERA,
    token1: "0xb2F776e9c1C926C4b2e54182Fac058dA9Af0B6A5"
  }
]

const BERA_BORROW_VAULTS = [
  {
    address: "0xe3D1716e2b9D8E3ae7E59dbC9588182d433B70f0",
    asset: "0x1cE0a25D13CE4d52071aE7e02Cf1F6606F4C79d3",
  }
]

const BURR_BEAR_VAULTS = [
  {
    address: "0x51639c7b0A8e20092Bf85F4c7eed74bF933972cC",
    asset: "0xD10E65A5F8cA6f835F2B1832e37cF150fb955f23",
    poolId: "0xd10e65a5f8ca6f835f2b1832e37cf150fb955f23000000000000000000000004",
    vault: "0xBE09E71BDc7b8a50A05F7291920590505e3C7744"
  },
  {
    address: "0x42dc43875401b2BA1db58be240A06E2e834BA07D",
    asset: "0xCbeF1B65399065c2DE2C495971e90466ff38f2d0",
    poolId: "0xcbef1b65399065c2de2c495971e90466ff38f2d000000000000000000000001e",
    vault: "0xBE09E71BDc7b8a50A05F7291920590505e3C7744"
  },
  {
    address: "0x3960DFdbDb82b67D31CD490aA4d0D7B3DF2087Ea",
    asset: "0x2A9EA10b60Ab02e9B8960a08b4996e6Bf5eA5EAb",
    poolId: "0x2a9ea10b60ab02e9b8960a08b4996e6bf5ea5eab000000000000000000000162",
    vault: "0x4Be03f781C497A489E3cB0287833452cA9B9E80B"
  }
]

async function beraTvl(api) {
  for (const vault of BERA_KODIAK_VAULTS) {
    // Get total token assets in kodiak island
    const {amount0Current, amount1Current} = await api.call({
      abi: "function getUnderlyingBalances() view returns (uint256 amount0Current, uint256 amount1Current)",
      target: vault.kodiakIsland
    })
    const vaultBalance = await api.call({
      abi: "function totalAssets() view returns (uint256 totalAssets)",
      target: vault.address,
    })
    const totalSupply = await api.call({
      abi: "erc20:totalSupply",
      target: vault.kodiakIsland
    })

    // Calculate vault assets based on island assets and vault balance
    const token0Balance = amount0Current * vaultBalance / totalSupply
    const token1Balance = amount1Current * vaultBalance / totalSupply

    api.add(vault.token0, token0Balance)
    api.add(vault.token1, token1Balance)
  }

  for (const vault of BULLA_VAULTS) {
    const vaultBalance = await api.call({
      abi: "function totalAssets() view returns (uint256 totalAssets)",
      target: vault.address,
    })
    const totalSupply = await api.call({
      abi: "erc20:totalSupply",
      target: vault.asset
    })
    const {total0, total1} = await api.call({
      abi: "function getTotalAmounts() view returns (uint256 total0, uint256 total1)",
      target: vault.asset
    })
    const token0AmountRaw = await api.call({
      abi: "erc20:balanceOf",
      target: vault.token0,
      params: [vault.asset]
    })
    const token1AmountRaw = await api.call({
      abi: "erc20:balanceOf",
      target: vault.token1,
      params: [vault.asset]
    })
    
    // Calculate vault assets based on island assets and vault balance
    const poolToken0Total = +total0+(+token0AmountRaw)
    const poolToken1Total = +total1+(+token1AmountRaw)
    const beranciaVaultShares = ((+vaultBalance) / (+totalSupply))
    const token0Balance = poolToken0Total * beranciaVaultShares
    const token1Balance = poolToken1Total * beranciaVaultShares

    api.add(vault.token0, token0Balance)
    api.add(vault.token1, token1Balance)
  }

  for (const vault of BERA_BORROW_VAULTS) {
    const vaultBalance = await api.call({
      abi: "function totalAssets() view returns (uint256 totalAssets)",
      target: vault.address,
    })
    api.add(vault.asset, vaultBalance)
  }

  for (const vault of BURR_BEAR_VAULTS) {
    const vaultBalance = await api.call({
      abi: "function totalAssets() view returns (uint256 totalAssets)",
      target: vault.address,
    })

    const totalSupply = await api.call({
      abi: "function getActualSupply() view returns (uint256 totalAssets)",
      target: vault.asset
    })

    const [tokens, balances] =  await api.call({
      abi: "function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)",
      target: vault.vault,
      params: [vault.poolId]
    })
    
    for (let i = 0; i<tokens.length; i++) {
      if (tokens[i]==vault.asset) {
        continue
      }
      const tokenBalance = balances[i] * vaultBalance / totalSupply
      api.add(tokens[i], tokenBalance)
    }
  }
}

module.exports = {
  berachain: {
    tvl: beraTvl
  }
};
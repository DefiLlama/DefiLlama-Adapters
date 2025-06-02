const { sumERC4626Vaults } = require('../helper/erc4626')

const config = {
  ethereum: {
    vaults: [
      // Token vaults
      "0x700886a402d42113aD94D9756f08A923BB5aC77A", // eETH
      "0xDa4D36dbdf5154B22580c0f1c998D37BfBB33D85", // ezETH
      "0xd75c669B3da058cf589bF0076FDaceDa40380C4d", // pufETH
      "0x9F3E781b25501A6b9051556B8058812D7Ba30549", // rsETH
      "0x6De2a95331400bb6cf9Cf75c7a8861d33687a95F", // stETH
      "0x7531b2AbA509E09566C08D61CaD6324b78444eCd", // wBTC
      "0xdb0d6F58a63118E20C91c0De84f4d8eA1a407C36", // weETH
      "0x2865568AD1CA0FE12dB53c8f866039Fa4500962F", // wETH
      "0xDEA5f3171C5052384a0a974E3C85b0d419c48204", // wstETH

      // PT vaults
      "0xeF0DF466417bC45007773C363866B3693fc0b1E7", // PT-weETH Jun 2024
      "0x31ec45f7dA20998775d594539F54e443e268f9F5", // PT-ezETH Apr 2024
      "0xf1365d1e96d0F9D1823C827286a9C3d40Dba6f30", // PT-ezETH(Zircuit) Jun 2024
      "0xF3b442217f18EB46417eFfd3A6cE09C3B311f4f5", // PT-pufETH Jun 2024
      "0x6D8c42855690c493E9c6404803478CD321A63376", // PT-rsETH Jun 2024
      "0x47764d88F8f54daD6Db75EC3667a11d58811ABc6", // PT-wstETH Dec 2024
        ],
        
    ethVaults: ['0xd94a9FBae86e662350FFEbB352f70c3CBeb9E96e'], //ETH vaults
  },
  arbitrum: {
    vaults: [
      // PT vaults
      "0xA2e9c6177f81a1337b656d3b066FD20c7Cf8cAb4", // ezETH
      "0xd94a9FBae86e662350FFEbB352f70c3CBeb9E96e", // rsETH
      "0x2865568AD1CA0FE12dB53c8f866039Fa4500962F", // weETH
      "0x6De2a95331400bb6cf9Cf75c7a8861d33687a95F", // wstETH
      "0x700886a402d42113aD94D9756f08A923BB5aC77A", // PT-weETH Jun 2024
      "0xDa4D36dbdf5154B22580c0f1c998D37BfBB33D85", // PT-ezETH Jun 2024
      "0xd75c669B3da058cf589bF0076FDaceDa40380C4d", // PT-rsETH Jun 2024
      "0x9F3E781b25501A6b9051556B8058812D7Ba30549", // PT-wstETH Dec 2024
    ],
  },
}

Object.keys(config).forEach(chain => {
  const { vaults, ethVaults = [], } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ethBals = await api.multiCall({ abi: 'uint256:balance', calls: ethVaults })
      api.addGasToken(ethBals)
      return sumERC4626Vaults({ api, calls: vaults })
    }
  }
})
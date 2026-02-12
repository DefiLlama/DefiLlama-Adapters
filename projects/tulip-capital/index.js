const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Tulip Capital.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x59e608E4842162480591032f3c8b0aE55C98d104',
      ],
      eulerVaultOwners: [
        '0x7c615e12D1163fc0DdDAA01B51922587034F5C93',
      ],
      turtleclub: [
        '0x6Bf340dB729d82af1F6443A0Ea0d79647b1c3DDf',
        '0x7895a046b26cc07272b022a0c9bafc046e6f6396',
        '0x686c83Aa81ba206354fDcbc2cd282B4531365E29',
      ],
      erc4626: [
        "0x936facdf10c8c36294e7b9d28345255539d81bc7", // Lagoon: RockSolid rock.rETH
        "0xb09f761cb13baca8ec087ac476647361b6314f98", // Lagoon: Flagship cbBTC
        "0x7a12D4B719F5aA479eCD60dEfED909fb2A37e428", // Lagoon: RockSolid Looped ETH Vault
        "0xce0b790ae0d8cf91e01f3fb69025e14569b574f3", // Lagoon: Tulipa USDC
      ],
    },
    berachain: {
      eulerVaultOwners: [
        '0x18d23B961b11079EcD499c0EAD8E4F347e4d3A66',
      ],
    },
    bob: {
      eulerVaultOwners: [
        '0x7c615e12D1163fc0DdDAA01B51922587034F5C93',
      ],
    },
    bsc: {
      eulerVaultOwners: [
        '0x7c615e12D1163fc0DdDAA01B51922587034F5C93',
      ],
    },
    avax: {
      erc4626: [
        "0x3048925b3ea5a8c12eecccb8810f5f7544db54af", // Lagoon: Turtle Avalanche USDC
        "0xb893c8d7000e0408eb7d168152ec7fefdd0d25e3", // Lagoon: Turtle Avalanche BTC.b
      ],
    },
    tac: {
      erc4626: [
        "0x279385c180f5d01c4a4bdff040f17b8957304762", // Lagoon: Noon USN TAC
      ],
    },
    monad: {
      erc4626: [
        "0x0da39b740834090C146dC48357f6A435a1Bb33b3", // Lagoon: MuDigital Tulipa USDC
        "0x09ca6b76276ec0682adb896418b99cb7e44a58a0", // Gearbox: Tulipa MON v3
      ]
    },
    base: {
      erc4626: [
        "0x61a8606e04d350dfa1d1aaa68b37260746ae47d4", // Creditcoop: Tulipa Credit Vault
      ]
    }
  }
}

module.exports = getCuratorExport(configs)

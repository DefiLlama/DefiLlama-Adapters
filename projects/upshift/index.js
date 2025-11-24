const abi = require('./vaultsv2.json')
const { sui } = require("../helper/chain/rpcProxy");
const axios = require("axios");

const suiVaultsEndpoint = "https://vaults.api.sui-prod.bluefin.io/api/v1/vaults/info";
const PACKAGE_ID =
  "0xc83d5406fd355f34d3ce87b35ab2c0b099af9d309ba96c17e40309502a49976f";

const config = {
  ethereum: ["0x69FC3f84FD837217377d9Dae0212068cEB65818e","0xdA89af5bF2eb0B225d787aBfA9095610f2E79e7D","0xEAA3b922E9fEbCa37d1c02D2142A59595094C605","0xf7b65fBA4d02110089fC6e2bE6d73809b45852f8","0x6625bA54DC861e9f5c678983dBa5BA96d19a9224","0x787f5541Ee40cD0c94175251686DDBbcf69A7344","0xD066649Bcb7d8D3335fE29CaD0AED6E17D5828B5","0x02991EE6134dEE504668e2227C5879Dd78EfCDc3","0x998D7b14c123c1982404562b68edDB057b0477cB","0x0985C88929A776a2E059615137a48bA5A473E25D","0xB7858b66dFA38b9Cb74d00421316116A7851c273", "0x80E1048eDE66ec4c364b4F22C8768fc657FF6A42", "0x18a5a3D575F34e5eBa92ac99B0976dBe26f9F869", "0xEBac5e50003d4B17Be422ff9775043cD61002f7f", "0xd684AF965b1c17D628ee0d77cae94259c41260F4", "0x5Fde59415625401278c4d41C6beFCe3790eb357f", "0xe1B4d34E8754600962Cd944B535180Bd758E6c2e", "0xc824A08dB624942c5E5F330d56530cD1598859fD","0xeb402fc96C7ed2f889d837C9976D6d821c1B5f01", "0x419386E3Ef42368e602720CC458e00c0B28c47A7", "0xB78dAf3fD674B81ebeaaa88d711506fa069E1C5E","0x7383c2454D23A1e34B35ba02674be0a41Bd5aa56","0xc428439fB7B1EFE56360Eb837Ca98F551fdD9B26","0x686c83Aa81ba206354fDcbc2cd282B4531365E29","0x396A3f77EE1faf5A3C46e878bA7b7a2dcbe55517", "0xE9B725010A9E419412ed67d0fA5f3A5f40159D32", "0x828BC5895b78b2fb591018Ca5bDC2064742D6D0f", "0x8AcA0841993ef4C87244d519166e767f49362C21"],
  avax: ["0x3408b22d8895753C9A3e14e4222E981d4E9A599E", "0xB2bFb52cfc40584AC4e9e2B36a5B8d6554A56e0b"],
  base: ["0x4e2D90f0307A93b54ACA31dc606F93FE6b9132d2"],
  hyperliquid: ["0x96C6cBB6251Ee1c257b2162ca0f39AA5Fa44B1FB", "0xc061d38903b99aC12713B550C2CB44B221674F94" ],
  bsc: ["0xD0b717ef23817b1a127139830Cf0FcD449ef74F0"],
  mezo: ["0x221B2D9aD7B994861Af3f4c8A80c86C4aa86Bf53"],
  monad: ["0xD793c04B87386A6bb84ee61D98e0065FdE7fdA5E", "0x64996271ee085ef9e6E939Ab3eACd93F7d7080db", "0xB667D005695D7f530A5621549aE31d9409486E29"]
}

const v2Vaults = {
  ethereum: ["0xAEEb2fB279a5aA837367B9D2582F898a63b06ca1","0xA38d92eC538e9aa3edb980b89701A9d38a1FE015","0x63C5d615e937697a80606788965E209414738820","0x18EE038C114a07f4B08b420fb1E4149a4F357249","0x3cC0D33B1AEac3d23eA89214b3AC5B4607032167","0x0C949AAf28bF0318bAa5f2cbF2F2D970f57879aB","0xd411aCaE2Bc7019322277A21ff005d94705661C5"],
  hyperliquid: ["0x8fFDcd8A96d293f45aA044d10b899F9D71897E8a" ],
  plasma: ["0x517677A19D8ae6FF600FB86C3C7bFCCD651e3eec"],
  monad: ["0x36eDbF0C834591BFdfCaC0Ef9605528c75c406aA"]
}



// Custom function to handle v2 vaults with getTotalAssets
async function sumV2Vaults(api, vaults) {
  const assets = await api.multiCall({ abi: abi[1], calls: vaults })
  const totalAssets = await api.multiCall({ abi: abi[0], calls: vaults })
  
  api.addTokens(assets, totalAssets)
}

// Merge all chains from both configs
const allChains = new Set([...Object.keys(config), ...Object.keys(v2Vaults)])

const suiVaultsTvl = async (api) => {
  const vaults = (
    await axios.get(suiVaultsEndpoint)
  ).data.Vaults;
  for (const vault of Object.values(vaults)) {
    const vaultTvl = await sui.query({
      target: `${PACKAGE_ID}::vault::get_vault_tvl`,
      contractId: vault.ObjectId,
      typeArguments: [vault.DepositCoinType, vault.ReceiptCoinType],
      sender:
        "0xbaef681eafe323b507b76bdaf397731c26f46a311e5f3520ebb1bde091fff295",
    });
    api.add(vault.DepositCoinType, vaultTvl[0]);
  }
}

module.exports = {
  doublecounted: true,
  methodology: "TVL is the sum of tokens deposited in erc4626 vaults",
}

allChains.forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      // Handle ERC4626 vaults if they exist for this chain
      if (config[chain]) {
        await api.erc4626Sum({ calls: config[chain], isOG4626: true })
      }
      
      // Handle v2 vaults if they exist for this chain
      if (v2Vaults[chain]) {
        await sumV2Vaults(api, v2Vaults[chain])
      }
      
      return api.getBalances()
    }
  }
})

   

module.exports.sui = {
  tvl: suiVaultsTvl,
}
const sdk = require("@defillama/sdk");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

const factory_contract = "0xD707d9038C1d976d3a01c770f01CB73a1fd305Cd"

const token_addresses = {
    "wUSDT": "0x32D2b9bBCf25525b8D7E92CBAB14Ca1a5f347B14",
    "wLA": "0x3a898D596840C6B6b586d722bFAdCC8c4761BF41",
    "wETH": "0x5ce9084e8ADa946AF09200c80fbAbCb1245E477F",
    "wMATIC": "0xC9AE905f288A3A3591CA7eee328eEd1568C14F32",
    "wBNB": "0x9483bDd8e088a2241f20F9241eFa3e3F6288ee20",
    "wAVAX": "0x690594910c2d58869d5F3FF205ebA1ff2A1B8245",
    "wFTM": "0x8c2E35a5825Ab407d2718402D15fFa8ec6D19acf",
    "wARBETH": "0x32DdEb2Cdd43eEF559d4B328cB14798E3C669215",
    "wHT": "0x20098F3A577fDb334FfBA2A128617664622eCBd6",
    "wONE": "0xC224866E0d39AC2d104Dd28F6398F3548ae0f318"
}

module.exports = {
    lachain: {
        tvl : calculateUsdUniTvl(factory_contract,
             "lachain",
              "0x3a898D596840C6B6b586d722bFAdCC8c4761BF41",
               [token_addresses['wUSDT'],
                token_addresses['wLA'],
                token_addresses['wETH'],
                token_addresses['wMATIC'],
                token_addresses['wBNB'],
                token_addresses['wAVAX'], 
                token_addresses['wFTM'],
                token_addresses['wARBETH'],
                token_addresses['wHT'],
                token_addresses['wONE']],
                "latoken")
    }
};

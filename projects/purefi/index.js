const { stakings } = require("../helper/staking");

const UFI = "0xe2a59d5e33c6540e18aaa46bf98917ac3158db0d";

const farming_Round_Contracts = [
  //--- Farming ---
  //UFI
  "0x33f86fDc03387A066c4395677658747c696932Eb",
  //ULTRA
  "0xAc8892AC86bB02F26544F31af06b86fdD2105862",
  //LTT
  "0x8a92E706cd359536D7A57dC9CC24054f7B17e021",
  //UFI-1
  "0x9ed4B0a2B8345EEb1e43A4D0298e351fc320D278",
  //UFI-2
  "0xafAb7848AaB0F9EEF9F9e29a83BdBBBdDE02ECe5",
  //--- Round ---
  //LTT
  "0x0274c78595B25eBBA4F9e20610422d04d8Dc8086",
  //SAFLE
  "0xfdd4eF64dA10fa5809AaBe98a225A4b94E53d8e1",
  //HAI
  "0x42554c3211e77e65a6c7b6e511be64b4adac6727",
  //IDTT
  "0x0e2F752C845Bdb31368d7012CA93f45AF345Ec73",
  //Distribution
  "0x2905f7d2B05b5Fb22afe4F2B84590f29Bb40D326"
];

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakings(farming_Round_Contracts, UFI, "bsc"),
    tvl: (tvl) => ({}),
  },
  methodology: "Counts liquidty on the Staking Only",
};

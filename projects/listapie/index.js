const config = {
  bsc: {
    velista: "0xd0C380D31DB43CD291E2bbE2Da2fD6dc877b87b3",
    listapie: "0x76865d4bfa513a3dd7f8a9977f3dd71e8ab2ca97",
    lista_token: "0xFceB31A79F71AC9CBDCF853519c1b12D379EdC46"
  }
}
const { sumTokensExport } = require('../helper/unwrapLPs');
async function staking(api) {
  const { velista, listapie, lista_token } = config[api.chain];


  let bal = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: velista, params: [listapie] });
  // (one velista=52lista)
  bal = bal / 52
  api.add(lista_token, bal)
}

module.exports = {
  bsc: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ["0xB2Aa63f363196caba3154D4187949283F085a488", "0x76865d4bfa513a3dd7f8a9977f3dd71e8ab2ca97"], // all lp tokens of lista dao held by listapie
        ["0x3685502Ea3EA4175FB5cBB5344F74D2138A96708", "0x76865d4bfa513a3dd7f8a9977f3dd71e8ab2ca97"],
        ["0x04d6115703b0127888323F142B8046C7c13f857d", "0x76865d4bfa513a3dd7f8a9977f3dd71e8ab2ca97"],
        ["0xDf0B9b59E92A2554dEdB6F6F4AF6918d79DD54c4", "0x76865d4bfa513a3dd7f8a9977f3dd71e8ab2ca97"],
        ["0x885711BeDd3D17949DFEd5E77D5aB6E89c3DFc8C", "0x76865d4bfa513a3dd7f8a9977f3dd71e8ab2ca97"],
        ["0xab092C47b23fBa03Ac1F0EC5F8E94110eb5Fff22", "0x76865d4bfa513a3dd7f8a9977f3dd71e8ab2ca97"],
        ["0xFceB31A79F71AC9CBDCF853519c1b12D379EdC46", "0x934c69e35cA3a2774Cc0aa36f5632f1C39f3aC36"], // Lista rush 1

      ],
      resolveLP: true,
    }),
    staking,
  },
};




module.exports.doublecounted = true
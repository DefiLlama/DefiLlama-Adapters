const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    // from https://insights.deribit.com/exchange-updates/deribit-wallet-holdings/
    owners: [
        "bc1qa3phj5uhnuauk6r62cku6r6fl9rawqx4n6d690",
        "bc1qtq5zfllw9fs9w6stnfgalf9v59fgrcxxyawuvm",
        "1MDq7zyLw6oKichbFiDDZ3aaK59byc6CT8",
        "1932eKraQ3Ad9MeNBHb14WFQbNrLaKeEpT",
        "13JJ1nxDeX5fMsDeyGHiLoK8rF2ayGq1cX",
        "1MdrdcEzfiJdvs6eVSwUx6bWboPX8if5U3",
        "35WHp4Hid61peyH4tuhNunwRj2gtNB41Lo",
        "34ZHV8dd6uucEUABUydWpKi6F4qKQntEUf",
        //added on the 26/06/2024 
        "bc1qzwhw94uldd3c8736lsxrda6t6x56030f8zk8nr",
        "bc1qrmuxak470z7zch5f3gz05dc6h4ngwqdq4wx80w",
        "bc1qf6lm99tp5p27hsmyskve236nsv32lnfwt4h8wk",
        "14HeA1YRUiJGb95HVpVTBuavMUBYGk6y7R",
    ],
  },
  ethereum:{
    owners: [
        "0x77021d475E36b3ab1921a0e3A8380f069d3263de",
        "0x5f397B62502e255f68382791947D54C4B2d37F09",
        "0xcfee6efec3471874022e205f4894733c42cbbf64",
        "0x2eeD6a08Fb89a5CD111efA33f8DcA46CfbEB370f",
        "0x6B378bE3c9642ccF25b1A27faCb8ace24aC34A12",
        "0xA7e15eF7C01B58eBe5eF74Aa73625Ae4b11FE754",
        "0x062448f804191128d71fc72e10a1d13bd7308e7e",
        "0xA0F6121319a34f24653fB82aDdC8dD268Af5b9e1",
        "0x904cC2B2694FFa78F04708D6F7dE205108213126",
        "0x63F41034871535ceE49996Cc47719891Fe03dff9",
        //added on the 26/06/2024 
        "0x58F56615180A8eeA4c462235D9e215F72484B4A3",
        "0x1baE874af9f81B8F93315b27F080260Da4702D3a",
        "0x2563328d58AC7eE9e930E89C29Ce96046a291207",
        "0x866c9a77d8Ab71d2874703e80cb7aD809b301e8e",
        "0xCf2027AAB22980820F0767d9f214CDBD2AA2428D"
    ]
  },
  solana: {
    owners:[
        "H8z2yZcrKo7ngiMz3Vsuw823nYo11qdCqs3sJDDjeTdD",
        "A5ANHizfayJUDBSwV5Cm7CNXCj6E6AAda49wzzdYPons",
        //added on the 26/06/2024 
        "BZo9RRbgsWaLMxyaYiJK9D27j2FAVgHrhMJBvAj7GiyG",
        "DL165xn6SrdupXGA2MW6woz35B3ssVqpYfwS1xAKdyx"
    ]
  },
  ethpow: {
    owners:[
        "0x77021d475E36b3ab1921a0e3A8380f069d3263de",
    ]
  },
  ripple: {
    owners:[
         //added on the 26/06/2024 
        "rpFXRE1LPyS48a4LMqyksG2sjDg8wmQD5e",
        "rE4y6xhfo9QUV2oAxpHtnVkMmGEk632T7R",
        "rK6enCZ6sMs84wMhTUgLhnPr9eyrTTNA6W",
        "rKK7VZnnqovrh5Gka1ANartX9Usx2aBAZd",
    ]
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'This wallets where collect from here https://insights.deribit.com/exchange-updates/deribit-wallet-holdings/'

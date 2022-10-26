const abi = require("./lockcontract_v3.abi.json");
const abi_v2 = require("./lockcontract.abi.json");

const ethereumContractData = [
    {
        chain: "ethereum",
        contract: "0xe2fe530c047f2d85298b07d9333c05737f1435fb",
        contractABI: abi,
        factory: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"
    },
    {
        chain: "ethereum",
        contract: "0xdbf72370021babafbceb05ab10f99ad275c6220a",
        contractABI: abi_v2,
        factory: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"
    },
    {
        chain: "ethereum",
        contract: "0xc77aab3c6d7dab46248f3cc3033c856171878bd5",
        contractABI: abi_v2,
        factory: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"
    },
]

const kavaContractData = [
  {
    chain: "kava",
    contract: "0xa9ec655dac35d989c0c8be075b1106dcd32502d6",
    contractABI: abi_v2,
    factory: "0x4FD2c40c25Dd40e9Bf0CE8479bA384178b8671b5",
  },
];

const polygonContractData = [
    {
        chain: "polygon",
        contract: "0x3eF7442dF454bA6b7C1deEc8DdF29Cfb2d6e56c7",
        contractABI: abi_v2,
        factory: "0x5757371414417b8c6caad45baef941abc7d3ab32"
    },
    {
        chain: "polygon",
        contract: "0x586c21a779c24efd2a8af33c9f7df2a2ea9af55c",
        contractABI: abi_v2,
        factory: "0x5757371414417b8c6caad45baef941abc7d3ab32"
    },
]

const avaxContractData = [
    {
        chain: "avax",
        contract: "0x88ada02f6fce2f1a833cd9b4999d62a7ebb70367",
        contractABI: abi_v2,
        factory: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10"
    },
    {
        chain: "avax",
        contract: "0xe2fe530c047f2d85298b07d9333c05737f1435fb",
        contractABI: abi,
        factory: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10"
    },
]


const bscContractData = [
    {
        chain: "bsc",
        contract: "0x0c89c0407775dd89b12918b9c0aa42bf96518820",
        contractABI: abi_v2,
        blacklist: [
            '0x6c7c87d9868b1db5a0f62d867baa90e0adfa7cfd',   //TNNS
            '0xf2619476bd0ca0eda08744029c66b62a904c2bf8',   //JRIT
            '0x854b4c305554c5fa72353e31b8480c0e5128a152',   //WEL
            '0x070a08beef8d36734dd67a491202ff35a6a16d97',   // SLP
            '0x9b83f4b893cf061d8c14471aa97ef24c352f5abe',   // ubec-lp
        ]
    },
    {
        chain: "bsc",
        contract: "0x7536592bb74b5d62eb82e8b93b17eed4eed9a85c",
        contractABI: abi_v2,
    },
]

module.exports = {
    ethereumContractData,
    polygonContractData,
    avaxContractData,
    bscContractData,
    kavaContractData
}
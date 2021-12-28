const Pools = [
  {
    id: 0,
    symbol: "DOP-ETH",
    label: "DOP/ETH",
    lpToken: "0x00aa1c57e894c4010fe44cb840ae56432d7ea1d1",
    type: "LP",
  },
  {
    id: 1,
    symbol: "NDR",
    label: "NDR",
    lpToken: "0x739763a258640919981F9bA610AE65492455bE53",
    type: "SINGLE",
  },
];

const tokensAddress = {
  masterchef: "0x8A78011bf2c42df82cC05F198109Ea024B554df9",
  dop_Ether: "0x00aa1c57e894c4010fe44cb840ae56432d7ea1d1",
  NDR: "0x739763a258640919981F9bA610AE65492455bE53",
  Comp: "0x6bB61215298F296C55b19Ad842D3Df69021DA2ef",
};

const infuraKey = "74d05a47b2814d4da023f4839fafbe9b";

module.exports = { Pools, tokensAddress, infuraKey };

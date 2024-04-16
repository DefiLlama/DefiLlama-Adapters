const GAUGE_TOKENS = [
  {
    erc20TokenAddress: "0x93ce650b8d3a7a7e44121db82a0429a3884db599",
    underlyingErc20TokenAddress: "0xbFcF63294aD7105dEa65aA58F8AE5BE2D9d0952A",
  },
  {
    erc20TokenAddress: "0xE49127B7AEfc043847caDd85B8a41973854D30f5",
    underlyingErc20TokenAddress: "0x8dff75976f22db58d7c3fd7b68d782238b0dbe30",
  },
  {
    erc20TokenAddress: "0x8A31A94bF0926B82083C80E18B331085B84E92D7",
    underlyingErc20TokenAddress: "0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8",
  },
  {
    erc20TokenAddress: "0xcc26a5246c6a04a85e997d6581c1b4f14363841a",
    underlyingErc20TokenAddress: "0xcfc25170633581bf896cb6cdee170e3e3aa59503",
  },
  {
    erc20TokenAddress: "0x9a7Ce41c96Db8d792497D7BEe70fAfb7F8393D71",
    underlyingErc20TokenAddress: "0x7e880867363A7e321f5d260Cade2B0Bb2F717B02",
  },
  {
    erc20TokenAddress: "0xd4EC67cF6C0Aa65F74eb7F03216Ea23151af21b8",
    underlyingErc20TokenAddress: "0x2932a86df44fe8d2a706d8e9c5d51c24883423f5",
  },
  {
    erc20TokenAddress: "0x4F1546Ce825dB85310aC2c2cfb369543d73FD0a2",
    underlyingErc20TokenAddress: "0xbD5445402B0a287cbC77cb67B2a52e2FC635dce4",
  },
  {
    erc20TokenAddress: "0x394Aa83d0E5D348c7FA39325d2A25993704Faf8f",
    underlyingErc20TokenAddress: "0xfb860600f1be1f1c72a89b2ef5caf345aff7d39d",
  },
  {
    erc20TokenAddress: "0xD1105d6502d3c562B447A75149B00aD366b3212d",
    underlyingErc20TokenAddress: "0x6991C1CD588c4e6f6f1de3A0bac5B8BbAb7aAF6d",
  },
  {
    erc20TokenAddress: "0xE08FF1427b199241506FcdCC23fcc24Dd98a4FA9",
    underlyingErc20TokenAddress: "0xDeFd8FdD20e0f34115C7018CCfb655796F6B2168",
  },
  {
    erc20TokenAddress: "0xC21545c26661ae74b3259B55aE007ACC4Bf5d4e3",
    underlyingErc20TokenAddress: "0x9D5C5E364D81DaB193b72db9E9BE9D8ee669B652",
  },
  {
    erc20TokenAddress: "0xa0Cd8B83B63381895C1854A605315fa7eF50e026",
    underlyingErc20TokenAddress: "0x512a68dd5433563bad526c8c2838c39debc9a756",
  },
  {
    erc20TokenAddress: "0x25aE9BE521898d33c7DF6Ae8c6669Fe038Bb3550",
    underlyingErc20TokenAddress: "0xecad6745058377744c09747b2715c0170b5699e5",
  },
  {
    erc20TokenAddress: "0x9434722bf29750B44649eb1b1A10a335d40edFc1",
    underlyingErc20TokenAddress: "0x27cace18f661161661683bba43933b2e6eb1741e",
  },
  {
    erc20TokenAddress: "0xF2280cBa8e0B9bc9b87b5aFbBeF8C41C20a5ddBe",
    underlyingErc20TokenAddress: "0xbe266d68ce3ddfab366bb866f4353b6fc42ba43c",
  },
  {
    erc20TokenAddress: "0x5F1894e4b409D7199Ea209b9e43C996640BCB691",
    underlyingErc20TokenAddress: "0x8605dc0c339a2e7e85eea043bd29d42da2c6d784",
  },
  {
    erc20TokenAddress: "0xa653510227752632ebf692a77e5032d4afFaB3a2",
    underlyingErc20TokenAddress: "0xC94208D230EEdC4cDC4F80141E21aA485A515660",
  },
  {
    erc20TokenAddress: "0xA1998B87C2935BDbd7fE6ee48542a59a0435a3Ee",
    underlyingErc20TokenAddress: "0x245Ec0d447e7f206B43120Ac292dED5E8bB9fe61",
  },
  {
    erc20TokenAddress: "0xC8c3031fB628Bdf4eA0F7cA5F96E369Dea07624e",
    underlyingErc20TokenAddress: "0x0404d05F3992347d2f0dC3a97bdd147D77C85c1c",
  },
  {
    erc20TokenAddress: "0xDc118133332f703e22C0b0FA7E0DD7d1299A7247",
    underlyingErc20TokenAddress: "0xB468dB2E478885B87D7ce0C8DA1D4373A756C138",
  },
  {
    erc20TokenAddress: "0xC6fDF0921c480Bd7Af89Ab4461D4aCDA24058a65",
    underlyingErc20TokenAddress: "0xAE0bFfc3110e69DA8993F11C1CBd9a6eA3d16daF",
  },
  {
    erc20TokenAddress: "0x6410ee1f8417a7cE1c3E68E3434c1d6beef6944E",
    underlyingErc20TokenAddress: "0x277d1424a84b35ec0a8108482551b00b4fc1539b",
  },
  {
    erc20TokenAddress: "0x9456cB3ae9fA8788ac1af4a7A18b339D4028061D",
    underlyingErc20TokenAddress: "0xc2fe9d3c761994897594df63b33b6d843ab7b1cf",
  },
  {
    erc20TokenAddress: "0x26dA2546602f63b84B3C4dF36476364f6350706E",
    underlyingErc20TokenAddress: "0x0e83df148f69965bfe752250835854b0dbeeaf01",
  },
  {
    erc20TokenAddress: "0x0a3fE1d39E5c60CfdB48Ba2Dc6B7c855289Dec7C",
    underlyingErc20TokenAddress: "0x35ad1acf0c4be5d4ba11342128d440fdb9e189eb",
  },
  {
    erc20TokenAddress: "0xA27fa5E11B121277423aC0b8b372596f2805e36a",
    underlyingErc20TokenAddress: "0xe2c422d954db416a69fb29137fe552cce0e160e9",
  },
  {
    erc20TokenAddress: "0x41e5c3aD70DA89dd7b6AF9Af3cd6861FbC31eA16",
    underlyingErc20TokenAddress: "0x621ef98282ac42d2bf4c20fc73912a16599e12fb",
  },
];

module.exports = GAUGE_TOKENS;

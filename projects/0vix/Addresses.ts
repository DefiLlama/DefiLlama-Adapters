

const master0vixContract = "0x8849f1a0cB6b5D6076aB150546EddEe193754F1C";
const oMATICContract = "0xE554E874c9c60E45F1Debd479389C76230ae25A8";
const rewardsContract = "0x048214fe9ac3ed92101cb695d92610f76e0f0337";

const WBTCStrategy = {
  name: 'WBTC',
  address: "0x3B9128Ddd834cE06A60B0eC31CCfB11582d8ee18",
  chain: 'polygon',
  project: '0vix'
}

const DAIStrategy = {
  name: 'DAI',
  address: "0x2175110F2936bf630a278660E9B6E4EFa358490A",
  chain: 'polygon',
  project: '0vix'

}

const WETHStrategy = {
  name: 'WETH',
  address: "0xb2D9646A1394bf784E376612136B3686e74A325F",
  chain: 'polygon',
  project: '0vix'
}

const USDCStrategy = {
  name: "USDC",
  address: "0xEBb865Bf286e6eA8aBf5ac97e1b56A76530F3fBe",
  chain: "polygon",
  project: '0vix'
}

const USDTStrategy = {
  name: "USDT",
  address: "0x1372c34acC14F1E8644C72Dad82E3a21C211729f",
  chain: "polygon",
  project: '0vix'
}

const MATICStrategy = {
  name: "MATIC",
  address: "0xE554E874c9c60E45F1Debd479389C76230ae25A8",
  chain: "polygon",
  project: '0vix'
}


module.exports = {
  WBTCStrategy,
  DAIStrategy,
  WETHStrategy,
  USDCStrategy,
  USDTStrategy,
  MATICStrategy,
  master0vixContract,
  oMATICContract,
  rewardsContract
};

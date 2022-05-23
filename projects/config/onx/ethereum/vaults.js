const createVaultModel = (poolAddress, vaultAddress) => {
  return {
    pool: poolAddress,
    vault: vaultAddress,
    chain: 'ethereum',
  }
}

const vaults = [
  {
    title: 'OnxEthSlp',
    ...createVaultModel('0x0652687e87a4b8b5370b05bc298ff00d205d9b5f', '0xAdb6d1cB866a52C5E8C1e79Ff8e0559c12F4D7a3'),
  },
  {
    title: 'WBtcWethSlp',
    ...createVaultModel('0xceff51756c56ceffca006cd410b03ffc46dd3a58', '0x2abCe7c4C77e215fcCc189E02Fc5D2A30b52a06a'),
  },
  {
    title: 'UsdcEthSlp',
    ...createVaultModel('0x397ff1542f962076d0bfe58ea045ffa2d347aca0', '0x637c871C559ade45b37074fCF3B8081Ec81c55FC'),
  },
  {
    title: 'UsdtEthSlp',
    ...createVaultModel('0x06da0fd433c1a5d7a4faa01111c044910a184553', '0xeAaE5CEfce1092eb3eA1DA7622B3cF4fb20B8b81'),
  },

  {
    title: 'SushiEthSlp',
    ...createVaultModel('0x795065dcc9f64b5614c407a6efdc400da6221fb0', '0xdC6f222c4504C43225a89b84E3aae15Ad0DFDF0F'),
  },
  {
    title: 'XsushiEthSlp',
    ...createVaultModel('0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7', '0x10A8dc3C0Db7BDFE1Db36d113c2685e60daaFEb8'),
  },
  {
    title: 'AEthcEthSlp',
    ...createVaultModel('0xfa5bc40c3bd5afa8bc2fe6b84562fee16fb2df5f', '0x6901Aac9813f3EfAae32F44E9b579f08A12707AD'),
  },
  {
    title: 'AnkrEthSlp',
    ...createVaultModel('0x1241f4a348162d99379a23e73926cf0bfcbf131e', '0x121eF4eEc2bb4D5eD91347166F02c0763af1C49A'),
  },
  {
    title: 'YfiEthSlp',//0
    ...createVaultModel('0x088ee5007c98a9677165d78dd2109ae4a3d04d0c', '0x431b1F5356EcAc2D86b2313907B747B16D11066f'),
  },

  {
    title: 'DaiEthSlp',
    ...createVaultModel('0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f', '0x5EA1b54C522f279ecC0182d9b35229d6435D42b7'),
  },
  {
    title: 'AaveEthSlp',//0
    ...createVaultModel('0xd75ea151a61d06868e31f8988d28dfe5e9df57b4', '0x9DB4AFCABdB25C89424c88e720dD47D6be43BdBe'),
  },
  {
    title: 'LinkEthSlp',
    ...createVaultModel('0xc40d16476380e4037e6b1a2594caf6a6cc8da967', '0xbd3a37e3690ad4e145c39983D0Aaf8bd5f5e2F29'),
  },
  {
    title: 'CompEthSlp',//0
    ...createVaultModel('0x31503dcb60119a812fee820bb7042752019f2355', '0x8d47f6fd4602B1ecF7928C0f1AEF9C215E3596b4'),
  },
  {
    title: 'CompEthSlp',//0
    ...createVaultModel('0x31503dcb60119a812fee820bb7042752019f2355', '0x8d47f6fd4602B1ecF7928C0f1AEF9C215E3596b4'),
  },

  {
    title: 'MkrEthSlp',//0
    ...createVaultModel('0xba13afecda9beb75de5c56bbaf696b880a5a50dd', '0x659217CdA99658AeBA399B4a79FB03D96B3c46bC'),
  },
  {
    title: 'AlphaEthSlp',
    ...createVaultModel('0xf55c33d94150d93c2cfb833bcca30be388b14964', '0xcedB7921013A012c5538C0d2925a90AA817Bef4D'),
  },
]

module.exports = {
  vaults,
}
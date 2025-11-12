const SALARIES_FACTORY_AVALANCHE = '0x7d507b4c2d7e54da5731f643506996da8525f4a3';
const SALARIES_FACTORY_POLYGON = '0xde1C04855c2828431ba637675B6929A684f84C7F';
const SALARIES_FACTORY_FANTOM = '0xde1C04855c2828431ba637675B6929A684f84C7F';
const SALARIES_FACTORY_MAINNET = '0xde1C04855c2828431ba637675B6929A684f84C7F';
const SALARIES_FACTORY_OPTIMISM = '0xde1C04855c2828431ba637675B6929A684f84C7F';
const SALARIES_FACTORY_ARBITRUM = '0xde1C04855c2828431ba637675B6929A684f84C7F';
const SALARIES_FACTORY_BSC = '0xde1C04855c2828431ba637675B6929A684f84C7F';
const SALARIES_FACTORY_XDAI = '0xde1C04855c2828431ba637675B6929A684f84C7F';
const SALARIES_FACTORY_METER = '0xc666badd040d5e471d2b77296fef46165ffe5132';
const SALARIES_FACTORY_METIS = '0x43634d1C608f16Fb0f4926c12b54124C93030600';

const VESTING_FACTORY = '0xB93427b83573C8F27a08A909045c3e809610411a';

const PAYMENTS_AVALANCHE = '0x4c48F145e0c80d97bFbc983dd2CbEbEE5d84FA0c';
const PAYMENTS_POLYGON = '0x02266E3b5cE26d62Ea73Ea7f2C542EBc24121c01';
const PAYMENTS_FANTOM = '0xDa33d4B2753B3C2439cA52678E1A506e4C5294d1';
const PAYMENTS_MAINNET = '0x056e39bDD2D35F4EB27478369BdAde51e0532b72';
const PAYMENTS_OPTIMISM = '0xb4E9D1F7b32937f04B856ec1Ca39AC83E9404779';
const PAYMENTS_ARBITRUM = '0x1564d7bFa4bc921A748Aedb3b71E578672528734';
const PAYMENTS_BSC = '0x02266E3b5cE26d62Ea73Ea7f2C542EBc24121c01';

const NEW_LLAMAPAY_SALARIES_FACTORY_ADDRESS = "0x09c39B8311e4B7c678cBDAD76556877ecD3aEa07"

module.exports = [
  {
    chain: 'avax',
    llamapayFactoryAddress: SALARIES_FACTORY_AVALANCHE,
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
    paymentsContract: PAYMENTS_AVALANCHE,
  },
  {
    chain: 'polygon',
    llamapayFactoryAddress: SALARIES_FACTORY_POLYGON,
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
    paymentsContract: PAYMENTS_POLYGON,
  },
  {
    chain: 'fantom',
    llamapayFactoryAddress: SALARIES_FACTORY_FANTOM,
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
    paymentsContract: PAYMENTS_FANTOM,
  },
  {
    chain: 'ethereum',
    llamapayFactoryAddress: SALARIES_FACTORY_MAINNET,
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0xcf61782465Ff973638143d6492B51A85986aB347',
    paymentsContract: PAYMENTS_MAINNET,
  },
  {
    chain: 'optimism',
    llamapayFactoryAddress: SALARIES_FACTORY_OPTIMISM,
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
    paymentsContract: PAYMENTS_OPTIMISM,
  },
  {
    chain: 'arbitrum',
    llamapayFactoryAddress: SALARIES_FACTORY_ARBITRUM,
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
    paymentsContract: PAYMENTS_ARBITRUM,
  },
  {
    chain: 'bsc',
    llamapayFactoryAddress: SALARIES_FACTORY_BSC,
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
    paymentsContract: PAYMENTS_BSC,
  },
  {
    chain: 'xdai',
    llamapayFactoryAddress: SALARIES_FACTORY_XDAI,
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
  },
  {
    chain: 'meter',
    llamapayFactoryAddress: SALARIES_FACTORY_METER,
  },
  {
    chain: 'metis',
    llamapayFactoryAddress: SALARIES_FACTORY_METIS,
  },
  {
    chain: 'base',
    llamapayFactoryAddress: NEW_LLAMAPAY_SALARIES_FACTORY_ADDRESS,
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
  },
  {
    chain: 'blast',
    llamapayFactoryAddress: NEW_LLAMAPAY_SALARIES_FACTORY_ADDRESS,
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
  },
  {
    chain: 'cronos',
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
  },
  {
    chain: 'fraxtal',
    llamapayFactoryAddress: NEW_LLAMAPAY_SALARIES_FACTORY_ADDRESS,
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
  },
  {
    chain: 'linea',
    llamapayFactoryAddress: NEW_LLAMAPAY_SALARIES_FACTORY_ADDRESS,
  },
  {
    chain: 'mantle',
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
  },
  {
    chain: 'scroll',
    llamapayFactoryAddress: NEW_LLAMAPAY_SALARIES_FACTORY_ADDRESS,
  },
  {
    chain: 'zora',
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
  },
  {
    chain: 'mode',
    llamapayFactoryAddress: NEW_LLAMAPAY_SALARIES_FACTORY_ADDRESS,
    vestingFactory: VESTING_FACTORY,
    vestingFactory_v2: '0x62E13BE78af77C86D38a027ae432F67d9EcD4c10',
  },
  {
    chain: 'polygon_zkevm',
    llamapayFactoryAddress: NEW_LLAMAPAY_SALARIES_FACTORY_ADDRESS,
  },
  {
    chain: 'sonic',
    vestingFactory_v2: "0xB93427b83573C8F27a08A909045c3e809610411a",
    llamapayFactoryAddress: "0x09c39B8311e4B7c678cBDAD76556877ecD3aEa07",
  },
  {
    chain: 'berachain',
    vestingFactory_v2: "0x4AcE3EDd57EfF1176a862E7B72Db090ECF2B84Bd",
    llamapayFactoryAddress: "0x09c39B8311e4B7c678cBDAD76556877ecD3aEa07",
  },
]
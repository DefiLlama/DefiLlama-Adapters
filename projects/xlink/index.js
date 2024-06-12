// TODO: add Stacks TVL

const { sumTokens } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json');

async function tvl(api) {
    const factories = config[api.chain];
    return sumTokens({ chain: api.chain, owners: factories.owners, tokens: factories.tokens });
}

module.exports = {
  methodology: "TVL of XLink is the sum of the tokens locked in its contracts",
  bitcoin: { tvl },
  bsc: { tvl },
  ethereum: { tvl },
  stacks: { tvl }
};

const config = {
    bitcoin: {
        owners:
        [
            'bc1q9hs56nskqsxmgend4w0823lmef33sux6p8rzlp',
            '32jbimS6dwSEebMb5RyjGxcmRoZEC5rFrS',
            'bc1qlhkfxlzzzcc25z95v7c0v7svlp5exegxn0tf58',
            '3MJ8mbu4sNseNeCprG85emwgG9G9SCort7'
        ],
        tokens: 
        [

        ]        
    },
    bsc: {
        owners:
        [
            '0xFFda60ed91039Dd4dE20492934bC163e0F61e7f5',    
        ],
        tokens:
        [
            ADDRESSES.bsc.USDT
        ]
    },
    ethereum: {
        owners: 
        [
            '0x13b72A19e221275D3d18ed4D9235F8F859626673'
        ],
        tokens:
        [
            ADDRESSES.ethereum.USDT            
        ]
    },
    stacks: {
        owners:
        [
            'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.cross-bridge-registry-v2-01',
            'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.btc-peg-out-endpoint-v2-01'
        ],
        tokens:
        [
            'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex',
            'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-abtc',
            'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-susdt',
            'SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-vlqstx'
        ]
    }
}
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const gcrocTokenAddress = "0x02D159a0c393B3A982c4Acb3d03816A42D94F1aB"; // done
const crocGenesisAddress = '0x172c36e07c377f70697E9ec11212152b57779b6f' // done
const gcrocRewardPoolAddress = "0x5d6cB50808f347BFc55D3a683bb170081DaBfa7b"; // done
const masonryAddress = "0x08abd7Cb539AB7c6d46939381ff607d33d7c6962"; // done

async function crocGenesisTVL(api) {
  const tokens = [
    ADDRESSES.avax.WAVAX, // WAVAX
    ADDRESSES.avax.USDC, // USDC
    ADDRESSES.avax.USDt, // USDT
    ADDRESSES.avax.WETH_e, // WETH.e
    "0xAAAB9D12A30504559b0C5a9A5977fEE4A6081c6b", // PHAR
    "0xFFFF003a6BAD9b743d658048742935fFFE2b6ED7", // KET
    "0x6F43fF77A9C0Cf552b5b653268fBFe26A052429b", // LAMBO
    "0x91a1C5a6001e6Aa628f49094658C65A19794D7f6", // PHARM
    "0xe03a08BD497a0F1dAed8F81D835C09242Bb82BCa", // sabcPHAR
    "0xe088d859D8BcE513b76Dc11C05D559254e28A336", // WIFE
    "0x5DDc8d968a94cf95CfeB7379F8372d858B9C797d", // WOLFI
    "0x34a528Da3b2EA5c6Ad1796Eba756445D1299a577", // ID
    "0x3D75F2BB8aBcDBd1e27443cB5CBCE8A668046C81", // HLP0
    "0x472F1bd4F431cEAE95c7f3382f715C0B1961ab8c", // UST
    ADDRESSES.avax.JOE, // JOE
    ADDRESSES.avax.SAVAX, // sAVAX
    "0xB8d7710f7d8349A506b75dD184F05777c82dAd0C", // ARENA
  ]

  return sumTokens2({ api, tokens, owner: crocGenesisAddress, })
}


const pool2 = async (api) => {
  let gauges = await api.call({ abi: 'address[]:getAllGauges', target: '0xAAAf3D9CDD3602d117c67D80eEC37a160C8d9869' })
  let pools = await api.multiCall({ abi: 'address:stake', calls: gauges, permitFailure: true })
  const pools2 = []
  const gauges2 = []
  pools.forEach((pool, i) => {
    if (!pool) return;
    pools2.push(pool)
    gauges2.push(gauges[i])
  })
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: gauges2.map(gauge => ({ target: gauge, params: gcrocRewardPoolAddress })) })
  api.add(pools2, bals)
  return sumTokens2({ api, tokens: pools2, })
};


module.exports = {
  methodology: "Pool2 deposits consist of CROC/S and GCROC/S LP tokens deposits while the staking TVL consists of the GCROCs tokens locked within the Masonry contract(0x08abd7Cb539AB7c6d46939381ff607d33d7c6962).",
  hallmarks: [
    [1739577600, 'Genesis Phase Ended']
  ],
  avax: {
    tvl: crocGenesisTVL,
     //pool2, comment out until pool2 tokens are available
    staking: staking(masonryAddress, gcrocTokenAddress),
  },
};
const ADDRESSES = require('../helper/coreAssets.json')
const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        '0xEF0Fc6322b2b5b02f0Db68f8eA74819560124b2d',
        '0x6D92f2E52481ce219D201EaA1b0Cf6839270152F',
        '0x2407b9B9662d970ecE2224A0403D3B15c7e4D1FE',
        '0xb188a49Da0836c289dcB4Fa0E856647a33DE537F',
        '0xA4FE2F90a8991A410c825C983CbB6A92d03607fc',
        '0xb79421720b92180487f71F13c5D5D8B9ecA27BF1',
        '0x4D24EecEcb86041F47bca41265319e9f06aE2Fcb',
        '0xF25d1D2507ce1f956F5BAb45aD2341e3c0DB6d3C',
        '0xb85E9868a0E8492353Db5C3022e6F96fc62F2306',
        '0x881f982575a3EcBEA6fe133ddB0951303215d130',
        '0xb6DFCF39503dddDe140105954a819e944CE543A7',
        '0xAA8bC1fc0FCfdcA5b7E5D35e5AC13800850d90C7',
        '0x37b6bD5fECE5b88B6E8e825196bcc868a2FeEd51',
        '0x763104507945B6b7f21Ee68b92048A53F7debF18',
        '0xe298dC1c377e4511f32Afd2362726c4F3A644356',
        '0x78bba2389c2cEEb6f94C70eD133712E3B3e2C4D0',
        '0x06051836ac6C5112b890f8b6Ec78e33D1AfeaE7c',
        '0x3698cc7F524BAde1a05e02910538F436a3E94384',
        '0x660e3Bd3bcDa11538fa331282666F1d001b87A42',
        '0xA916a54af7553BAe6172e510D067826Bd204d0dD',
        '0xA15B94629727152c952a6979d899F71426cE7976',
        '0xf809c975eFAD2Bc33E21B5972DB765A6230E956A',
        '0x892787C947fdd1CF6C525C6107d80265D3D7EBb4',
        '0x8c7Efd5B04331EFC618e8006f19019A3Dc88973e',
        '0xCCFA6f3b01c7bf07B033A9d496Fdf22F0cdF5293',
        '0x90f76616d34Cb6A1F4423B33c0201B2A1980Fc81',
        ADDRESSES.ethereum.FTM,
        ADDRESSES.ethereum.MATIC,
        '0xC1723Af0Dc5400A1cAAa47E76a45c39538A6AD49',
        '0x07E114C06462D8892Ae4574A7502b8c1c0FBdFbb',
        '0x274c427B1BF0bB4a137EDE688c6D621263CA7Ce8',
        '0xD4D7Aedb9AbeEC03101dB6f8426DeeE390E3cCF9',
        '0x50B0063161e507bEc6c21cC23FD11EC2945b7b52',
        '0x29A62a542b6EA441abB6F03C2bca54aD72fF750C', //
    ],
  },
  bsc: {
    owners: [
        '0x2407b9B9662d970ecE2224A0403D3B15c7e4D1FE',
        '0xb79421720b92180487f71F13c5D5D8B9ecA27BF1',
        '0x4D24EecEcb86041F47bca41265319e9f06aE2Fcb',
        '0xF25d1D2507ce1f956F5BAb45aD2341e3c0DB6d3C',
        '0x8c7Efd5B04331EFC618e8006f19019A3Dc88973e',
        '0x1CE0c2827e2eF14D5C4f29a091d735A204794041',
        '0xAda1fA671651D335998c6a0dE336a78F5b49Ad3F',
        '0x7cCCf66DB1A0d4069a52A0C26859EDbC34177065',
        '0xf250EE103b8e4C5b9825a270e5c70Ea0C113c854',
        '0x59548449926551ACb5480d610292c4266b872beF', //
    ]
  },
  bitcoin: {
    owners: bitcoinAddressBook.coindcx
  },
  tron: {
    owners: [
        'TGjpmhAFT6d7eBKvaFwPVN6H2pDKgLLZiw',
        'TU7BbAsb8t371eMijQeiGXsiLvY1vZbsFs',
        'TPaRk5RJmDjYfUwrE6JcJ91miqUa4xU9PN',
        'THEAKkH9JuhF5oWTy9jSeumAYyHSFBepAw',
        'TLvAURZkwUJpRvfccNiCuXqktaaBbu8NVi',
        'TM5r1bNJ2TjZwfS757tPPtr84MwtEjL9qN',
        'TDePQj7ZfFNuDJdWJE7Gy2L9LcndW9Gpjq',
        'TWQ4PG879vT5Cqu55iMpSy4WhMPdG7bKYr',
        'TDdT3q5TZVR7RvsQx6fxik3wjCYdFGxBVy',
        'TFLxNHunhEizmeEdiMyA3r2XGLSKaEznGd', //
        'TAWK8YMnn7yAfnQRyvjiBv9ksocFt9qNdR',
        'TVayqwydqcX1sEuzmxfXz2fHJcuCNGwYVN',
        'TVYH5Y4KstUfRNx1ZQbqgdtX1Jw3bMTKtJ'
    ]
  },
  cardano: {
    owners: [
        'addr1qy7f98r5ar2ayyst7lmm90tl630tsetygecz36vq33qmvevngs3w3w3mt4l3em80z5f9e64j0jj37hazql87nfmzrfqs3f7gum',
        'addr1qy5dqjx4mtegqu6kx5gu6upkk96c8haf38eksj5tr8g5dae2z9j36evkf2ek7zej3exgls6czmr4vz3ff8h952f3933sw25zf4',
        'addr1q90372c396d7w0cw3agseaj8vf4t8m9e3lwwc752jd30hyt4pthja5v60hfjesrayhrc7tnasnsev0uka3c0vpukazms5uw76h',
        'addr1qyu9n5wtyufnp6vuhcak38tx4lw37znzkulat7s987xtv86xx265k42gtvuvkt4vyjjxgqn9wat2zmda3f7ns2pl2y2qwtgdav',
        'addr1q9h690lw5hpd37r4ngmlhf0y8wms394y4dlm0wa6nmann9pm8fwxgvusmpkhsgtl3gdlj988mllq7teadjlk3eld3c6qyc3yf6',
        'addr1qx47g9mejkukkspsp6jdjdzf2lmektye8w7n0cm9ukxvewdljr2awtjh5r9kgt5evrkk6j4fe2pe33etuvazrg3flnnsg0jlex',
        'addr1q8m3qp920cljg5g079909xrvhngfln5u9n8xug6jtz44rfsm9sj09fksz42yhj3gfcukrlfarty39dac26wd5wp2gsrqc6cuxk',
        'addr1qx824fl32wrgankldpnyt7txz0mel5d9cldfkus4xykl3uzqzu4gt7tqpysglu8xz7fgt4ym6el57wl7fm80wy99d3ks0srn98',
        'addr1q8xeul4sslt5xyeaa02vzgquwagv84t9xcjekauja5cz4wsat2uc2fe4mqfdzaaag2y9nevju4p5va0yqf0tuj9cmu7ql9emkc',
        'addr1q9m8eq44qcqe40yz0jwcuc3vs9t7zr6ukz8ctvfkjma5dmxdlpn5em67csmpgdeqvkjl6ppwe29a85ddgdmmg0nmpfusnq98e6',
        'addr1qyzrghamkktczv3wujrdqt243emzu49zu0z3vxw768kpy0fknd8whx6gnzwtg78yxfuxwu4z8k4zsk9rvx34sxalet5sgjcn56',
    ]
  },
  ripple: {
    owners: [
        'rGcT3Dpz9Dk3oV7hsDT7Q1s6NRPo9a8iDt',
        'rMa4tVPUFTBC7Zzg1BkDwVWPLuE8bbQMX9',
        'rKa1G2q15ya4Xr3U3LVdEhBpR3H1CUNnQN',
        'rLUpiBeLhUyEzVtBkYE4S9t4zhdybSSARw',
        'rBjVFQDVC7WvAZNrpvapfq7MhSUMhj68wa',
    ]
  },
 solana: {
    owners: [
        'AjCHG7CYJST379Eh7xLqhRaUyBzurFKjsX7z8DTrfGZp',
        'HwgxMWxaq5cDbdVmoH24Gy8F9m9DkU7Mwgdbgh4mh2m7',
        '6p8LxMvHUZtdiik28TQy483WaCaDGsAUFm3PKjpUpLB',
        'Bq6NnW55ToJrAM7NxUYDmSMbKKCQ6f742ZemLiypqjzY',
        '92qQCjprXoJ5GYji5it8PJTneBFxzSJ6mYosQWxYKxx4',
        'EhZLSqyWrazhqR5bmyyEfFRa3ycWu9KPgQgQ7G1R9zC9',
        '5bjZPeHbdGUCduyY8i2dZkkgLWkG3u1P2sbt1Jb5kFxW',
        'EUXVDPCwXe9sJt3VucYfveB1kk5piSWJqhWQEsFtE2CR',
        '9buzBcTujdQLyf1XkyLaSrGNbkyNxg8qML3bpKWCz9P6',
        '8nFGjbJNdarBouEC856Qmhrm8fptuEUnZrpNKgougsLi',
        '8W4u11KJYhmCY9rs2MCVHmMrgpeHLgsbkwAarbNvzr2Y',
        '6fuHoq5Tr2j6dFTGWHmLUhVBUj8XvDBgdGGzgfSwe5DN',
        '4E73T5Zubx3kPtheJ5DB6QMEaadMQowhUcdRV6f9rvVt',
        '8zSWFy8wvHEuFJ7CZ81wy2wn4fPaju6jc6tbtbv5x9f8',
        '6XuYJv4PyauP2WKdgd4fZYvjK7uBdVkEySoy89fXV9XT',
        '3Nvb6UeEMVLf9DsehhqT8B5SNHrNLEpHdf42nXi9aLK8',
    ]
 },
 avax: {
  owners: [
      '0x2407b9B9662d970ecE2224A0403D3B15c7e4D1FE',
      '0xb79421720b92180487f71F13c5D5D8B9ecA27BF1',
      '0xF25d1D2507ce1f956F5BAb45aD2341e3c0DB6d3C',
      '0xAda1fA671651D335998c6a0dE336a78F5b49Ad3F',
      '0x978E746330870627CC353092eDd2dBA3Cc99461c',
         ]},
  arbitrum: {
   owners: [
          '0xAda1fA671651D335998c6a0dE336a78F5b49Ad3F'
      ]},
  fantom: {
    owners: [
            '0x8c7Efd5B04331EFC618e8006f19019A3Dc88973e',
            '0xAda1fA671651D335998c6a0dE336a78F5b49Ad3F',
            '0x0B5ffAE844a4B21c7beeDed2595F22215288173C',
            '0x50B0063161e507bEc6c21cC23FD11EC2945b7b52',
        ]},
   polygon: {
      owners: [
                  '0xAda1fA671651D335998c6a0dE336a78F5b49Ad3F',
                  '0x5fED0d9bE6FD42e086E0D4F1bF6ceCd19635dEAd',
                  '0x07E114C06462D8892Ae4574A7502b8c1c0FBdFbb',
              ]},
    litecoin: {
        owners: [
                  'ltc1qtzcxl7jt4m35h44kww26fvfc50c0turvv88rte',
                  'LTJu6BRKJiipjnJtiystZaRYC7NsGeWtrD',
                  'ltc1q6gr2sjm87x92wjrdrt8uhdy87r39la4c4chwvq',
                  'LeNU94XpxtQGpeoyY6ZtxRv5yfvBnGpn1r',
                  'LeiiKS5cWutJoakb4abBmPZr5tCqcmBaBb',
                  'ltc1q6hddqqfe9zjfmazp06kr8h5wl6qvmwpcctppk9',
             ]},
      optimism: {
        owners: [
                  '0xAda1fA671651D335998c6a0dE336a78F5b49Ad3F',
                ]
            },
    }


module.exports = cexExports(config)
module.exports.methodology = 'We got this wallets from CoinDCX on the 16/01/2024. We are not tracking their ETH validators. On the 17/01/2024 they had 32 ETH validators.'
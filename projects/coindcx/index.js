const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        '0x2e5129e77c928D96b5A70c0effB97Ee6e95D77b6',
        '0x3698cc7F524BAde1a05e02910538F436a3E94384',
        '0x37b6bD5fECE5b88B6E8e825196bcc868a2FeEd51',
        '0x38f76d1C8fcC854fb4d2416dDAeC8Df41Ab60867',
        '0x4D24EecEcb86041F47bca41265319e9f06aE2Fcb',
        '0x660e3Bd3bcDa11538fa331282666F1d001b87A42',
        '0x763104507945B6b7f21Ee68b92048A53F7debF18',
        '0x78bba2389c2cEEb6f94C70eD133712E3B3e2C4D0',
        '0x881f982575a3EcBEA6fe133ddB0951303215d130',
        '0x892787C947fdd1CF6C525C6107d80265D3D7EBb4',
        '0x8c7Efd5B04331EFC618e8006f19019A3Dc88973e',
        '0xA15B94629727152c952a6979d899F71426cE7976',
        '0xA4FE2F90a8991A410c825C983CbB6A92d03607fc',
        '0xA916a54af7553BAe6172e510D067826Bd204d0dD',
        '0xAA8bC1fc0FCfdcA5b7E5D35e5AC13800850d90C7',
        '0xCCFA6f3b01c7bf07B033A9d496Fdf22F0cdF5293',
        '0xEF0Fc6322b2b5b02f0Db68f8eA74819560124b2d',
        '0xF25d1D2507ce1f956F5BAb45aD2341e3c0DB6d3C',
        '0xb188a49Da0836c289dcB4Fa0E856647a33DE537F',
        '0xb6DFCF39503dddDe140105954a819e944CE543A7',
        '0xb79421720b92180487f71F13c5D5D8B9ecA27BF1',
        '0xb85E9868a0E8492353Db5C3022e6F96fc62F2306',
        '0xe298dC1c377e4511f32Afd2362726c4F3A644356',
        '0xf809c975eFAD2Bc33E21B5972DB765A6230E956A',
    ],
  },
  bsc: {
    owners: [
        '0x4D24EecEcb86041F47bca41265319e9f06aE2Fcb',
        '0x660e3Bd3bcDa11538fa331282666F1d001b87A42',
        '0x8c7Efd5B04331EFC618e8006f19019A3Dc88973e',
        '0xF25d1D2507ce1f956F5BAb45aD2341e3c0DB6d3C',
        '0xF379FcD9C996d85de025985bA9B1C9C96DAa4a72',
        '0xb79421720b92180487f71F13c5D5D8B9ecA27BF1',
    ]
  },
  bitcoin: {
    owners: [
        '12T8i8tpeczk5JGf8ppZf1w6SFBRwEa9y4',
        '12hGEyxk4zMLquxiMiFrkvYSohsXz2D3uZ',
        '1477uXZ1NfUaaZZdnztQ7h8ftGRpuWQPfA',
        '17mxRZ9WeXigSwg3Cm62HxeATnuUphMxGL',
        '1CJ7XmM3C72i5qDgEJAkzWq5VDJ51gbdLR',
        '1F6CrpEnHEZh6gQtJ7cf1MtK7Y8GYKoP4i',
        '1HLkxeuEDCFMbKGCzXR1uAdMJgjJcpNs2H',
        '1JV3umtGC6H6tFUVoFyV5KwbJDscUwrtX7',
        '1KXxS6QnzpB8mSLm5kmXJXqvZF7wVvQDCw',
        '1MzSJodjNmACPKyj9VUv9X55Pby87osLhc',
        '1PRwacjHVksLNTkSYNkiWkRgTm1yDSgLMG',
        'bc1q7c9ylgjsyc0yaxwm84jjh6avfajzfe7dhk6e0e',
        'bc1qedxsgzuj8ga644gwlqw4nw7f3xncq4g2rskmzu',
        'bc1qffg4ya27430vv5ymg2lhf4mj7tvtc3ur5qyyq3',
        'bc1qhlyrdhfqry06nj902p9dxdftm4pxkhdqeum8y8',
        'bc1qucl4n347qc6e48w85xdxcv86sm3an8fr250hhm',
        'bc1qygg2x02cfy0e6r7798v4qrcjjkzm8tl5t0xkwf',
        'bc1qz22hegkllltcydg3pz3an6h352mjmyp7n2vhd9',     
    ]
  },
  tron: {
    owners: [
        'TAWK8YMnn7yAfnQRyvjiBv9ksocFt9qNdR',
        'TGjpmhAFT6d7eBKvaFwPVN6H2pDKgLLZiw',
        'THEAKkH9JuhF5oWTy9jSeumAYyHSFBepAw',
        'TLvAURZkwUJpRvfccNiCuXqktaaBbu8NVi',
        'TM5r1bNJ2TjZwfS757tPPtr84MwtEjL9qN',
        'TPaRk5RJmDjYfUwrE6JcJ91miqUa4xU9PN',
        'TU7BbAsb8t371eMijQeiGXsiLvY1vZbsFs',
        'TVYH5Y4KstUfRNx1ZQbqgdtX1Jw3bMTKtJ',
        'TVayqwydqcX1sEuzmxfXz2fHJcuCNGwYVN',
    ]
  },
  cardano: {
    owners: [
        'addr1q8m3qp920cljg5g079909xrvhngfln5u9n8xug6jtz44rfsm9sj09fksz42yhj3gfcukrlfarty39dac26wd5wp2gsrqc6cuxk',
        'addr1q8xeul4sslt5xyeaa02vzgquwagv84t9xcjekauja5cz4wsat2uc2fe4mqfdzaaag2y9nevju4p5va0yqf0tuj9cmu7ql9emkc',
        'addr1q90372c396d7w0cw3agseaj8vf4t8m9e3lwwc752jd30hyt4pthja5v60hfjesrayhrc7tnasnsev0uka3c0vpukazms5uw76h',
        'addr1q9h690lw5hpd37r4ngmlhf0y8wms394y4dlm0wa6nmann9pm8fwxgvusmpkhsgtl3gdlj988mllq7teadjlk3eld3c6qyc3yf6',
        'addr1qx47g9mejkukkspsp6jdjdzf2lmektye8w7n0cm9ukxvewdljr2awtjh5r9kgt5evrkk6j4fe2pe33etuvazrg3flnnsg0jlex',
        'addr1qx824fl32wrgankldpnyt7txz0mel5d9cldfkus4xykl3uzqzu4gt7tqpysglu8xz7fgt4ym6el57wl7fm80wy99d3ks0srn98',
        'addr1qy5dqjx4mtegqu6kx5gu6upkk96c8haf38eksj5tr8g5dae2z9j36evkf2ek7zej3exgls6czmr4vz3ff8h952f3933sw25zf4',
        'addr1qy7f98r5ar2ayyst7lmm90tl630tsetygecz36vq33qmvevngs3w3w3mt4l3em80z5f9e64j0jj37hazql87nfmzrfqs3f7gum',
        'addr1qyu9n5wtyufnp6vuhcak38tx4lw37znzkulat7s987xtv86xx265k42gtvuvkt4vyjjxgqn9wat2zmda3f7ns2pl2y2qwtgdav',
        'addr1qyzrghamkktczv3wujrdqt243emzu49zu0z3vxw768kpy0fknd8whx6gnzwtg78yxfuxwu4z8k4zsk9rvx34sxalet5sgjcn56',
    ]
  },
  ripple: {
    owners: [
        'rKa1G2q15ya4Xr3U3LVdEhBpR3H1CUNnQN',
        'rLUpiBeLhUyEzVtBkYE4S9t4zhdybSSARw',
        'rMa4tVPUFTBC7Zzg1BkDwVWPLuE8bbQMX9',
    ]
  },
 solana: {
    owners: [
        '4E73T5Zubx3kPtheJ5DB6QMEaadMQowhUcdRV6f9rvVt',
        '5bjZPeHbdGUCduyY8i2dZkkgLWkG3u1P2sbt1Jb5kFxW',
        '6XuYJv4PyauP2WKdgd4fZYvjK7uBdVkEySoy89fXV9XT',
        '6fuHoq5Tr2j6dFTGWHmLUhVBUj8XvDBgdGGzgfSwe5DN',
         // '6p8LxMvHUZtdiik28TQy483WaCaDGsAUFm3PKjpUpLB',
        '8W4u11KJYhmCY9rs2MCVHmMrgpeHLgsbkwAarbNvzr2Y',
        '8nFGjbJNdarBouEC856Qmhrm8fptuEUnZrpNKgougsLi',
        '8zSWFy8wvHEuFJ7CZ81wy2wn4fPaju6jc6tbtbv5x9f8',
        '92qQCjprXoJ5GYji5it8PJTneBFxzSJ6mYosQWxYKxx4',
        '9buzBcTujdQLyf1XkyLaSrGNbkyNxg8qML3bpKWCz9P6',
        'Bq6NnW55ToJrAM7NxUYDmSMbKKCQ6f742ZemLiypqjzY',
        'EUXVDPCwXe9sJt3VucYfveB1kk5piSWJqhWQEsFtE2CR',
        'EhZLSqyWrazhqR5bmyyEfFRa3ycWu9KPgQgQ7G1R9zC9',
        'HwgxMWxaq5cDbdVmoH24Gy8F9m9DkU7Mwgdbgh4mh2m7',
    ]
 }
}
module.exports = cexExports(config)
module.exports.methodology = 'We are not counting their binance spot account'
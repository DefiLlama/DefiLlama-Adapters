const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
      '0x2910543af39aba0cd09dbb2d50200b3e800a63d2',  // - Cold Wallet
      '0xae2d4617c862309a3d75a0ffb358c7a5009c673f',  // - Hot Wallet
      '0x43984d578803891dfa9706bdeee6078d80cfc79e',  // - Internal
      '0x66c57bf505a85a74609d2c83e94aabb26d691e1f',  //  Hot Wallet
      '0xda9dfa130df4de4673b89022ee50ff26f6ea73cf',  // - Cold Wallet
      '0xa83b11093c858c86321fbc4c20fe82cdbd58e09e',  // - Hot Wallet
      '0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13',  // - Cold Wallet
      '0xe853c56864a2ebe4576a807d26fdc4a0ada51919',  // - Cold Wallet
      '0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0',  // - Hot Wallet
      '0xfa52274dd61e1643d2205169732f29114bc240b3',  // - Internal
      '0x53d284357ec70ce289d6d64134dfac8e511c8a3d',  // - Cold Wallet
      '0x89e51fA8CA5D66cd220bAed62ED01e8951aa7c40',  // - Hot Wallet
      '0xc6bed363b30df7f35b601a5547fe56cd31ec63da',  // - Hot Wallet
      '0x29728d0efd284d85187362faa2d4d76c2cfc2612',  // - Hot Wallet
      '0xe9f7eCAe3A53D2A67105292894676b00d1FaB785',  // - Hot Wallet
    ],
  },
  bitcoin: {
    owners: [
      'bc1qnhmemsqfhycvp6g50v732h7wfwdt68el4ux5ttu8xwsrzngmxv0qr55aga',
      'bc1qa5aux0l2c3l99tpmd9c85770kqpksg3g6dxaw03jj6lphnwy4lqq68xfgc',
      'bc1q3gqqnn9hr0uachfk6rv3qhf3pp9z8a4z63ksc5qu0c2vvtykqd9qj3fyum',
      'bc1qplr053c80nzlqapuatfslyhmns6sfn32qzz3xkdn36jjryw8vsys8y7wlc',
      'bc1qhxv3pg2hsnw3m9jukuc6erjwwd03rzwhd2k6zh5uf6s2lwpuv3rq9zefru',
      'bc1q08n37tm63z3f0myqe6zjx7ymtng8c9qedpwpplq95qkmx0cpke7qyz4y8v',
      'bc1q02cq8du8r7ktuy5l0ltc4cv82xnaw4upaaw8y4rq6uycdp0k5nmquljtzk',
      'bc1qcf9qe8ytx5qlcq0ft4vm2xm3fyfvurrkende46hpmwwnzpctfu3szxpve2',
      'bc1qrj5vg73fxs6h6pmdjld387j5szkswc2y39rfutw8gl93h647wpksukyln9',
      'bc1q9hqaqzyf6zsd330pkvtq5uxcxprzr368zdsxx5srtep7kepx523q2gd0ef',
      'bc1q36l8mssxdlncj7njkqvayv3jumked9jdtjxete66cxnzluf4j0msjm4w80',
      'bc1qs8cyln26t2f5rwu2frnqvtltfxt0qqql0elmhrpsexlzveap82eqtyvsgu',
      'bc1qcds58swh4g6zsdmws9ltcdpqz4l44utu5wv9vfpmemps3whgdacqkakrk0',
      'bc1q75tsfq2c5cqp2ss32qksmnzd9yea2mjsjktdmrz900dcmg43ck4s66sgjx',
    ],
  },
}

module.exports = cexExports(config)

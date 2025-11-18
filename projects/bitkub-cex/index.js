const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  bitcoin: { owners: bitcoinAddressBook.bitkub },
  ethereum: {
    owners: [
      "0x1579B5f6582C7a04f5fFEec683C13008C4b0A520",
      "0xaD0703a267f97e19034FD564d731C4e6d888f9ef",
      "0x831e8C86197C3993eb1238b3Ac22E42e3B7f2Fd9",
      "0x7A1CF8CE543F4838c964FB14D403Cc6ED0bDbaCC",
      "0xE35bb4845149eCC6799C98ceEeF7ff7c85440e6f",
      "0x59E0cDA5922eFbA00a57794faF09BF6252d64126",
      "0x326d9f47ba49bbaac279172634827483af70a601",
      "0x4A3b441962BB481cdffF2650D84EBEC0f119CbB7",
      "0x6B130820c449A27b35256A3c99942adbD53AAC18",
      "0xFBA420CdAEE2df4e38a622d36616c3547AB6aaB4",
    ],
  },
  cardano: {
    owners: [
      "addr1q8080hxmacdlnhrjllmurq35uj8jnj4ak0egxyl0zx6y9hns6jxls0ngn2qadghy4h7dterk0gzm3y7czmh8zlsfvmesug72j9",
      "addr1q9lnc0jsh3f76hmapmsf8m7d6a32gm993gyhjspfvjgpdatl8sl9p0zna40h6rhqj0hum4mz53k2tzsf09qzjeyszm6s6n08gw",
      "addr1vx7vlgvuupzvvls99penvatpm2c4j9ljscevzsnn3awk8ys6xynxk",
      "addr1q8rgxa3edn03lywl8c9hk6p3c6rpyf9frhqe6a97qtrjktkxsdmrjmxlr7ga70st0d5rr35xzgj2j8wpn46tuqk89vhqaglq5q",
      "addr1qyswadm6cz8u2lt8eh752d8434dgtjuvkmp3yv00klcuqm50s7wwjnhjjrt6h206nlzavqmsaqfllzslny5zyhfhemgslhpqe5",
      "addr1q9pag8w4fhlfntk53te5ggjcxfv3a47pjs3kp79espx0xa3ry9xxlmzqcs8t8xj28xmw5l34pcdshnm80hjlsl0rlgwst42fps",
      "addr1q8w6ydejn4v89cxmvmltzg4g0y4xkg84p3sqf3gmdst032pef9780gqwzm4c5q3m4juvp5q08e37yx9rvhfxahv7kywqn7h8jp",
      "addr1q93njnfcfeky7ygfg5wjk3pms74qnxtashr7xmwnzykxpgp4yjdypphupnvrnskz8uj55cuzydmnmmnjvy70hytezjssux9ahu",
      "addr1qxdsu34cmfw7er4zmd4702szx7yhc9gayrnyv6lsm89k6mafmzzku8yt4xqu7tqh3qctas87ukfswf0h3ytq9c92razqph7vpw",
      "addr1qylmz3tepjdum5alfegjw80xawkqxrqy0lzl9ndhrcmr0dg34hvrr6m7qg538lpd6ppvxe7gp47rm36vyjw9cckuc0qsg26ngm",
      "addr1q8j70zld3p2dhpgkxksprpsmzm4qhfhm2l6w9wk44gqs6264x2gg8f3gacy3x74ew8felyagrtq3lztx4cnx90cs09fsp87nrj",
      "addr1q94vgjd7zfesgq06vgtrqe9q9g2rjtl6yn35gepwta9eqz25ts95j7frk9yh479d2fqln76xj4gldjflczkqwq003q3s39lprc",
      "addr1q9vp536dm7jz05h8qfux247yl4c2cnzrz6kj9p3wh6u98gxuef7ar9t9kpnwpnnksgz8x4tuqtup6jch7yg55kns3p5s4vhaqa",
      "addr1qxt89e3xnepa336w0t6td4as2awn0e57nk6f025r26rwug8q8t28pdfqtkt90eeafdf4axmzrh46cg65u47z59tscj3qfpxyxx",
      "addr1q9fe0wv28yd6pse9hrwqn8rhcudj42e4z3a5vveqyqww6uys8ta3zga2drsxq42e003wxm7lvxt9skmrnst8f6z7sytqke4up9",
      "addr1q8km36sd4wgt6f5e3n557nk454tqwxzg670fxylsztsccq5yy7w9y0uz4hlc3j2veln52xu3ktrrrzkr4p9ays0uhu5q6vukqh",
      "addr1qx26c2mdztwk02fyn43692lzqcxscf0ujye06vv3jadhsazwram6xhx09z4yka4q6uexkelc92df9dysnjf5nhajvmnq2e4qwf",
      "addr1qxxm602az76en6rjyvurmdpv7sj8jwxxfxv9jvjrttvrxt5l8pzavzkxpxuha8ra90t0h3s2zs5dhv2jmaq3mm6snfkqdmj5vl",
      "addr1qxrs00m9qntkxhru8vdmd4xz562rv3ajck36l9yvcs06nwzcx8u53x99sahetdtaascmug9363m5sjjx8aullxgswvesy5td9l",
      "addr1q9czs903atc9hmz9vf8sdrqgk33dz9hnwdgpgx98q4fsnj9t3n4wl5p8j9uqg4ewj740uupwjsv4c8p0eckuh3p0tjasl8v77f",
      "addr1q9xfm9pxac0vhxym802eagwmtc0aus5w5uhc0tg9rslzzhfcj99akd57ewpta8ww9wf3vp9af3psmyw62vy00tvk3yaq9c3yw6",
      "addr1q98xhywsa3xgu79ftrjyrfg6e2wrxfgqvepnudusw58ee6vmw0j8gzw6hmyuefah02purkfvqj6x2pz2wpjr26mr8r7qv6v2qa",
      "addr1qxpah9ck505d7dvxvkvh33v5awrxv89vvjcduhfu29fr7dns6jxls0ngn2qadghy4h7dterk0gzm3y7czmh8zlsfvmesxrkkg7",
    ],
  },
  base: {
    owners: [
      "0x7b7B40D0FfC52005AdE856D4F65008BFf7d4D4a6",
      "0x7A1CF8CE543F4838c964FB14D403Cc6ED0bDbaCC",
      "0x4EBBb4DeEd5dA01B1F882F237BA3a19e83Baaeea",
    ],
  },
  algorand: {
    owners: [
      "CT7HPFSYMKHPJES4GEEA5VE6ML7PF4JUOKNSJNDK7MXYNYLMMTFJ7XDETY",
      "Q3GDAVXJLVHL2YNTIP35LMXEIZRGLLANSUGXGG4O2O44RZYYFNAU32OBNU",
      "6CBNVPFCWAPEA2C2Y34JP7JDDNZI6YXG5JMPNCSYZOLB24IF3CALRRUSUQ",
      // "B6PJYYQSVT7F3NNJMGTR7MGS6AA5RLHY5LUGSWJSRXUQQQJZEFZ3QQ2BPE",
    ],
  },
  bsc: {
    owners: [
      "0xC68C8d9d435c1C8a04909A7D8eA588d1031ae1E9",
      "0xAdf4c208d546E7F1Ec24cab1CcDA9B47B90B8540",
      "0x7A1CF8CE543F4838c964FB14D403Cc6ED0bDbaCC",
      "0x2B8A2A03883E790fd8731823fcaC3E7af0a6dab3",
      "0xe8FbDA2Ac282a0EBb73d3f4089AD130312eDb8DA",
      "0xa2FF973Bf5A7c33cE4591226b03cf0afc5F16D37",
      "0xd8A184BBEB7098E45a7bDCe1f88BFb5785Cb22bA",
      "0x427E2cb82551D247daA712ebECf5FaC7F1d955Ad",
      "0x1ecCd85c9E21f247FadB70F6cFf94B14cb737d03",
      "0x3A67638883EfF7856b286ccd373d36476C45407a",
      "0x45De26036ebe8a611FD361324872E887B5839564",
      "0x85f44C42bAA806047f1d9aAea362333200FC5d10",
      "0x8F19c19Fd4B6b3363fd1f214FF7781FBceBdba6d",
      "0x165c97f4a371e69A747678bA1893Be023b284f4a",
      "0x034bda447330D010554A5a93A22fF45a2505f494",
      "0x42b3cd5676FFD76D29A587Fe8aAdE7e35BF7D1B5",
      "0xBf36D6540c310996a21537c0193ACA1756884C40",
      "0x6Fc29dFF13345574FaD530a8DBCC7Bb4A43Ad045",
      "0x56152e13828f78cDCC90A6b016dF0aeC0985e2f3",
      "0xc686D5a4A1017BC1B751F25eF882A16AB1A81B63",
      "0x074b08B84E7400E9E5446CcE14d446b36B6351B5",
    ],
  },
  aptos: {
    owners: [
      "0x73f6a587b4bc245bf3eeaa31b7ffe490d4c297a4960023b9548c1a4187bbe826",
    ],
  },
  arbitrum: {
    owners: [
      "0x3ad60935c48f59cad57794eea41c60574735b4c9",
      "0x799cb7688637824025F2Ae0BE78baA4854EB10f9",
      "0x77aB048B5A14385450DfE21a676930E391B0c50C",
      "0x0573AdF35a54475CBe10992Ba7C7dC11a80f39Ab",
      "0x3040028E91D2a5D1E780c8E1a771A1A243f8921A",
      "0xb8a63Da460063aB54aE52c73693Fc554E38E7794",
      "0x7836c2eaD68809CEB6168E70558E46eB454209B9",
      "0xc49839a2eDd1A2c4B23b080734a72CA9ff8DF666",
      "0xCacb823a3D0C5a8490B1d3E60d1f33AB1eEB0387",
      "0xFa87f3ae8Bf869d4f6138F47a5682dD9E4458EE3",
      "0x7A1CF8CE543F4838c964FB14D403Cc6ED0bDbaCC",
    ],
  },
  avax: {
    owners: [
      "0xCee64C0fD6E455B629ee82404094Bb0FD7a015d3",
      "0xf521f4f06253a2c9db5732c6838b82cf472ccb6b",
      "0xed450b3a875eaab5366cdc6746b1aa95c1f87009",
      "0x16eCE576723AE9640053C2a5e100E21Ae6879915",
      "0xaE0B49663C51C8e00795e935186e7C8D425Aa4Fd",
      "0x134282ea729a0a129f331d9950d399f22545e8b8",
      "0x376AD7FB3842475725D276D77b85883474B9050C",
      "0x91013c9c7c2a856B26dF52A8A117Afeb9FC90379",
      "0x7A1CF8CE543F4838c964FB14D403Cc6ED0bDbaCC",
    ],
  },
  litecoin: {
    owners: [
      "ltc1qdjslxvcf0sdp7glpm7uyj97dnc8ml32c820jjr",
      "MV6PFbiFu9hAzav77zvArKnVbepqzgLai6",
      "LX3BfLPmTpNAqemj9QZKu4SLTMrU9M4W4a",
    ],
  },
  mantle: {
    owners: [
      "0x93593B52373775B6387Bb136fb662a1B2B95D28C",
      "0x7A1CF8CE543F4838c964FB14D403Cc6ED0bDbaCC",
    ],
  },
  optimism: {
    owners: [
      "0xda4231EF1768176536EEE3ec187315E60572BBD4",
      "0x7A1CF8CE543F4838c964FB14D403Cc6ED0bDbaCC",
      "0x18f59d6945C3847d837bC7bF2E402C2F91FdBF04",
      "0xE24568D364A170B9D768AF5AaB2E9bFfFE628fAA",
      "0xB2a4bE10ff7599e748a59EF66DF574EA14FdD28e",
      "0x4BB9326ac2721cECc34737FCCE2FeA5fe78Ec88F",
      "0x87F05730C7fC9D20EE8f2776b6E12675e344d323",
      "0xfE7Ad27596CA67A134Cc227FCCEEe02fD7BaCC46",
      "0x4da9F5048B530EC1B0A415d3d4D82f1C0A0F3d77",
      "0x34d68b60F2BB5983a85dCE33A9Fbc74135EA05d6",
    ],
  },
  polygon: {
    owners: [
      "0xCa7404EED62a6976Afc335fe08044B04dBB7e97D",
      "0x98a81ce4e94249beb329f04b9595e10735ae6ab0",
      "0xac72565ccf186f10e6a7a3964492c62be5757e31",
      "0x9573A11d939753737E8F09f80f07f6462C093a1c",
      "0x7A1CF8CE543F4838c964FB14D403Cc6ED0bDbaCC",
    ],
  },
  solana: {
    owners: [
      "CqLu65KkFvGi3DUrR9o9aUC4LP2yUywFHZn8WoNLNVgy",
      "99GQKbo1m2dU2ETGtEB1of9F6QHne5o9HHjAc7MyiVSn",
      "FEpW539FYXJLpuKxPEuFZhtBHqv3o3V5qKtQa8wxN6qQ",
      "7Z4YASPhNRbebWGx4GuzEWFAETZyRdN1GQTFTnM8t5c2",
      "9ZxAqUEP5aYBCHakuVt9ojL15jfy9oMiaeQv5ewk2c7J",
      "EwA9sKvmKwTpKr9BqYmsYi2UjKEMm3aPsihmFfT7Q9DM",
    ],
  },
  tron: {
    owners: [
      "TUokA66synv9BN4T2VPSRZivNedcbkhfJF",
      "TN6yULseUiJF7WZUruRQqMTUb1VTDBdsqG",
      "TRHQmybCizoiMCA3ev4pNTb5PLJmgpSztQ",
      "TLpzN1ztwi47kK8Wip2VvmDMFwnMyWnHwj",
    ],
  },
  ripple: {
    owners: [
      "rnrqyM7kS6wmC5demJm9vrfdN2vLgS8LfY",
      "rE3Cc3i6163Qzo7oc6avFQAxQE4gyCWhGP",
      "rsgwNP2cyRHAcEbuRmboDQ4pmgemMNVZR3",
      "rN2AVDJj927YbdAvTXoDtq8uswbQvFU42t",
      "rfZCcK6EMCYeAX3y86X281xwgRLcH82SAw",
      "rwa1MPnDwpRsgJ4jmZHuBo42xK9YVpp45P",
    ],
  },
  era: {
    owners: [
      "0xe65eE83E7B466CB3836f666BaAeB4ed6d29B5723",
      "0x7A1CF8CE543F4838c964FB14D403Cc6ED0bDbaCC",
    ],
  },
  core: {
    owners: [
      "0x1CA1817eD440b26Fb005748f3CE9f8db160A5C0a",
      "0x7A1CF8CE543F4838c964FB14D403Cc6ED0bDbaCC",
    ],
  },
  fantom: {
    owners: [
      "0xE9BB729A7eA588c2ad10acaF647124503Dbb08d1",
      "0x7A1CF8CE543F4838c964FB14D403Cc6ED0bDbaCC",
      "0xDD374d8202D43a18BE95C8B64C41a87a9898889f",
    ],
  },
  ton: {
    owners: [
      "UQC99FRwIlV2iLvDwFDyIfSVFQms5fUKtVZKidKuFTKItH2h",
      "UQDByM-88YEJtGq4UTZx3FOgZFZ6URHPYD11wf9AcBrajchg",
    ],
  },
  doge: {
    owners: [
      "A3UdEKpx5HR1hJvKKw7iVbwp6MRn3yZAiK",
      "ACkC8PjakegrmPFaL12FVDPCn8HwdKzSCY",
      "AAuxfoiADXxMgbZPZ42xE6TCnFnz2FK33e",
      "A5XHmCEG2TbaUnCiZnganw29EsDDnUQXjj",
      "A59WR7LTBiBbSx3QZbf7SwQ6q3PHnP33wK",
      "A4RZ3WfKxyWDPvMkFGM2Uzo8rDd6wwBqK5",
      "9tAKQbiRPJxosnuUFGivL2kP3UEEeqdnd1",
      "AD7E3QXB5go9AtE2uueMr3Dw767eWi5ruy",
      'DTqm2UCi6AS1nSCo9jZ8AejZ3k1ZcF8qix',
      'A2is3pqH2jz8jcRNV2QEFnLF3FAP5hBEoB',
      'DBrNiTbgpHHeveemLNnKwNDEJwXRGGRb1L',
      'D788kYSZYsVWSoLVejipE1Q4cN8Spom5eU',
      'DNvZftCnAsfrzzfe6R3dF6Sugz7W4Qgs6b',
      'DPYV66VirzChkotHXPryAhcfvyQmeArV2y',
      'DHBERwF4LVLVwQzDtfPz9zEtKPnWW9NSDH',
      'DTWmAfdTkrtqv7GmN2vE74VTkXkgQUFRSn',
      'DDm2XmWXhq3fxHd9fUaqnbmxanaFuKSG1s',
      'DHt3teN3iNSG7rJ8GaGz5EeHYFieCf8Qin',
      'D5GmmrSZ1xDut5Nj1s4C4ncA1v3EGfbk15',
      'DNpbFixXn611Qd9SZDBDjS4NhFPAXG8t1X',
      'D7pEtDnFU3ZgTykZt54SXvGeF1YSt2PVbe',
      'DCWvgKHcs1KUDqYe55rTX8m6uaJ67gaAp5',
      'DBdkivVhGhmbBRSsbt2s55MtZ38ngs86nS',
    ],
  },
};

module.exports = cexExports(config);

(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,363178,e=>{"use strict";var t=e.i(271645),r=(e,t,r,o,s,a,n,i)=>{let l=document.documentElement,c=["light","dark"];function u(t){var r;(Array.isArray(e)?e:[e]).forEach(e=>{let r="class"===e,o=r&&a?s.map(e=>a[e]||e):s;r?(l.classList.remove(...o),l.classList.add(a&&a[t]?a[t]:t)):l.setAttribute(e,t)}),r=t,i&&c.includes(r)&&(l.style.colorScheme=r)}if(o)u(o);else try{let e=localStorage.getItem(t)||r,o=n&&"system"===e?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e;u(o)}catch(e){}},o=["light","dark"],s="(prefers-color-scheme: dark)",a="undefined"==typeof window,n=t.createContext(void 0),i={setTheme:e=>{},themes:[]},l=()=>{var e;return null!=(e=t.useContext(n))?e:i},c=e=>t.useContext(n)?t.createElement(t.Fragment,null,e.children):t.createElement(p,{...e}),u=["light","dark"],p=({forcedTheme:e,disableTransitionOnChange:r=!1,enableSystem:a=!0,enableColorScheme:i=!0,storageKey:l="theme",themes:c=u,defaultTheme:p=a?"system":"light",attribute:y="data-theme",value:w,children:b,nonce:g,scriptProps:x})=>{let[k,v]=t.useState(()=>d(l,p)),[C,W]=t.useState(()=>"system"===k?f():k),I=w?Object.values(w):c,P=t.useCallback(e=>{let t=e;if(!t)return;"system"===e&&a&&(t=f());let s=w?w[t]:t,n=r?m(g):null,l=document.documentElement,c=e=>{"class"===e?(l.classList.remove(...I),s&&l.classList.add(s)):e.startsWith("data-")&&(s?l.setAttribute(e,s):l.removeAttribute(e))};if(Array.isArray(y)?y.forEach(c):c(y),i){let e=o.includes(p)?p:null,r=o.includes(t)?t:e;l.style.colorScheme=r}null==n||n()},[g]),O=t.useCallback(e=>{let t="function"==typeof e?e(k):e;v(t);try{localStorage.setItem(l,t)}catch(e){}},[k]),q=t.useCallback(t=>{W(f(t)),"system"===k&&a&&!e&&P("system")},[k,e]);t.useEffect(()=>{let e=window.matchMedia(s);return e.addListener(q),q(e),()=>e.removeListener(q)},[q]),t.useEffect(()=>{let e=e=>{e.key===l&&(e.newValue?v(e.newValue):O(p))};return window.addEventListener("storage",e),()=>window.removeEventListener("storage",e)},[O]),t.useEffect(()=>{P(null!=e?e:k)},[e,k]);let A=t.useMemo(()=>({theme:k,setTheme:O,forcedTheme:e,resolvedTheme:"system"===k?C:k,themes:a?[...c,"system"]:c,systemTheme:a?C:void 0}),[k,O,e,C,a,c]);return t.createElement(n.Provider,{value:A},t.createElement(h,{forcedTheme:e,storageKey:l,attribute:y,enableSystem:a,enableColorScheme:i,defaultTheme:p,value:w,themes:c,nonce:g,scriptProps:x}),b)},h=t.memo(({forcedTheme:e,storageKey:o,attribute:s,enableSystem:a,enableColorScheme:n,defaultTheme:i,value:l,themes:c,nonce:u,scriptProps:p})=>{let h=JSON.stringify([s,o,i,e,c,l,a,n]).slice(1,-1);return t.createElement("script",{...p,suppressHydrationWarning:!0,nonce:"undefined"==typeof window?u:"",dangerouslySetInnerHTML:{__html:`(${r.toString()})(${h})`}})}),d=(e,t)=>{let r;if(!a){try{r=localStorage.getItem(e)||void 0}catch(e){}return r||t}},m=e=>{let t=document.createElement("style");return e&&t.setAttribute("nonce",e),t.appendChild(document.createTextNode("*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),document.head.appendChild(t),()=>{window.getComputedStyle(document.body),setTimeout(()=>{document.head.removeChild(t)},1)}},f=e=>(e||(e=window.matchMedia(s)),e.matches?"dark":"light");e.s(["ThemeProvider",()=>c,"useTheme",()=>l])},207670,e=>{"use strict";function t(){for(var e,t,r=0,o="",s=arguments.length;r<s;r++)(e=arguments[r])&&(t=function e(t){var r,o,s="";if("string"==typeof t||"number"==typeof t)s+=t;else if("object"==typeof t)if(Array.isArray(t)){var a=t.length;for(r=0;r<a;r++)t[r]&&(o=e(t[r]))&&(s&&(s+=" "),s+=o)}else for(o in t)t[o]&&(s&&(s+=" "),s+=o);return s}(e))&&(o&&(o+=" "),o+=t);return o}e.s(["clsx",()=>t,"default",0,t])},974891,470525,e=>{"use strict";function t(e){if(!Number.isSafeInteger(e)||e<0)throw Error(`positive integer expected, not ${e}`)}function r(e,...t){if(!(e instanceof Uint8Array||null!=e&&"object"==typeof e&&"Uint8Array"===e.constructor.name))throw Error("Uint8Array expected");if(t.length>0&&!t.includes(e.length))throw Error(`Uint8Array expected of length ${t}, not of length=${e.length}`)}function o(e){if("function"!=typeof e||"function"!=typeof e.create)throw Error("Hash should be wrapped by utils.wrapConstructor");t(e.outputLen),t(e.blockLen)}function s(e,t=!0){if(e.destroyed)throw Error("Hash instance has been destroyed");if(t&&e.finished)throw Error("Hash#digest() has already been called")}function a(e,t){r(e);let o=t.outputLen;if(e.length<o)throw Error(`digestInto() expects output buffer of length at least ${o}`)}e.s(["bytes",()=>r,"exists",()=>s,"hash",()=>o,"number",()=>t,"output",()=>a],974891);let n="object"==typeof globalThis&&"crypto"in globalThis?globalThis.crypto:void 0,i=68===new Uint8Array(new Uint32Array([0x11223344]).buffer)[0],l=e=>e<<24&0xff000000|e<<8&0xff0000|e>>>8&65280|e>>>24&255;function c(e){for(let t=0;t<e.length;t++)e[t]=l(e[t])}function u(e){return"string"==typeof e&&(e=function(e){if("string"!=typeof e)throw Error(`utf8ToBytes expected string, got ${typeof e}`);return new Uint8Array(new TextEncoder().encode(e))}(e)),r(e),e}function p(...e){let t=0;for(let o=0;o<e.length;o++){let s=e[o];r(s),t+=s.length}let o=new Uint8Array(t);for(let t=0,r=0;t<e.length;t++){let s=e[t];o.set(s,r),r+=s.length}return o}class h{clone(){return this._cloneInto()}}function d(e){let t=t=>e().update(u(t)).digest(),r=e();return t.outputLen=r.outputLen,t.blockLen=r.blockLen,t.create=()=>e(),t}function m(e){let t=(t,r)=>e(r).update(u(t)).digest(),r=e({});return t.outputLen=r.outputLen,t.blockLen=r.blockLen,t.create=t=>e(t),t}function f(e=32){if(n&&"function"==typeof n.getRandomValues)return n.getRandomValues(new Uint8Array(e));throw Error("crypto.getRandomValues must be defined")}e.s(["Hash",()=>h,"byteSwap32",()=>c,"concatBytes",()=>p,"createView",0,e=>new DataView(e.buffer,e.byteOffset,e.byteLength),"isLE",0,i,"randomBytes",()=>f,"rotr",0,(e,t)=>e<<32-t|e>>>t,"toBytes",()=>u,"u32",0,e=>new Uint32Array(e.buffer,e.byteOffset,Math.floor(e.byteLength/4)),"wrapConstructor",()=>d,"wrapXOFConstructorWithOpts",()=>m],470525)},280355,e=>{"use strict";var t=e.i(974891),r=e.i(470525);let o=(e,t,r)=>e&t^~e&r,s=(e,t,r)=>e&t^e&r^t&r;class a extends r.Hash{constructor(e,t,o,s){super(),this.blockLen=e,this.outputLen=t,this.padOffset=o,this.isLE=s,this.finished=!1,this.length=0,this.pos=0,this.destroyed=!1,this.buffer=new Uint8Array(e),this.view=(0,r.createView)(this.buffer)}update(e){(0,t.exists)(this);let{view:o,buffer:s,blockLen:a}=this,n=(e=(0,r.toBytes)(e)).length;for(let t=0;t<n;){let i=Math.min(a-this.pos,n-t);if(i===a){let o=(0,r.createView)(e);for(;a<=n-t;t+=a)this.process(o,t);continue}s.set(e.subarray(t,t+i),this.pos),this.pos+=i,t+=i,this.pos===a&&(this.process(o,0),this.pos=0)}return this.length+=e.length,this.roundClean(),this}digestInto(e){(0,t.exists)(this),(0,t.output)(e,this),this.finished=!0;let{buffer:o,view:s,blockLen:a,isLE:n}=this,{pos:i}=this;o[i++]=128,this.buffer.subarray(i).fill(0),this.padOffset>a-i&&(this.process(s,0),i=0);for(let e=i;e<a;e++)o[e]=0;!function(e,t,r,o){if("function"==typeof e.setBigUint64)return e.setBigUint64(t,r,o);let s=BigInt(32),a=BigInt(0xffffffff),n=Number(r>>s&a),i=Number(r&a),l=4*!!o,c=4*!o;e.setUint32(t+l,n,o),e.setUint32(t+c,i,o)}(s,a-8,BigInt(8*this.length),n),this.process(s,0);let l=(0,r.createView)(e),c=this.outputLen;if(c%4)throw Error("_sha2: outputLen should be aligned to 32bit");let u=c/4,p=this.get();if(u>p.length)throw Error("_sha2: outputLen bigger than state");for(let e=0;e<u;e++)l.setUint32(4*e,p[e],n)}digest(){let{buffer:e,outputLen:t}=this;this.digestInto(e);let r=e.slice(0,t);return this.destroy(),r}_cloneInto(e){e||(e=new this.constructor),e.set(...this.get());let{blockLen:t,buffer:r,length:o,finished:s,destroyed:a,pos:n}=this;return e.length=o,e.pos=n,e.finished=s,e.destroyed=a,o%t&&e.buffer.set(r),e}}let n=new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0xfc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x6ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]),i=new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]),l=new Uint32Array(64);class c extends a{constructor(){super(64,32,8,!1),this.A=0|i[0],this.B=0|i[1],this.C=0|i[2],this.D=0|i[3],this.E=0|i[4],this.F=0|i[5],this.G=0|i[6],this.H=0|i[7]}get(){let{A:e,B:t,C:r,D:o,E:s,F:a,G:n,H:i}=this;return[e,t,r,o,s,a,n,i]}set(e,t,r,o,s,a,n,i){this.A=0|e,this.B=0|t,this.C=0|r,this.D=0|o,this.E=0|s,this.F=0|a,this.G=0|n,this.H=0|i}process(e,t){for(let r=0;r<16;r++,t+=4)l[r]=e.getUint32(t,!1);for(let e=16;e<64;e++){let t=l[e-15],o=l[e-2],s=(0,r.rotr)(t,7)^(0,r.rotr)(t,18)^t>>>3,a=(0,r.rotr)(o,17)^(0,r.rotr)(o,19)^o>>>10;l[e]=a+l[e-7]+s+l[e-16]|0}let{A:a,B:i,C:c,D:u,E:p,F:h,G:d,H:m}=this;for(let e=0;e<64;e++){let t=m+((0,r.rotr)(p,6)^(0,r.rotr)(p,11)^(0,r.rotr)(p,25))+o(p,h,d)+n[e]+l[e]|0,f=((0,r.rotr)(a,2)^(0,r.rotr)(a,13)^(0,r.rotr)(a,22))+s(a,i,c)|0;m=d,d=h,h=p,p=u+t|0,u=c,c=i,i=a,a=t+f|0}a=a+this.A|0,i=i+this.B|0,c=c+this.C|0,u=u+this.D|0,p=p+this.E|0,h=h+this.F|0,d=d+this.G|0,m=m+this.H|0,this.set(a,i,c,u,p,h,d,m)}roundClean(){l.fill(0)}destroy(){this.set(0,0,0,0,0,0,0,0),this.buffer.fill(0)}}let u=(0,r.wrapConstructor)(()=>new c);e.s(["sha256",0,u],280355)},806685,e=>{"use strict";var t=e.i(608861),r=e.i(796516);function o(e,o){if(!(0,r.isAddress)(e,{strict:!1}))throw new t.InvalidAddressError({address:e});if(!(0,r.isAddress)(o,{strict:!1}))throw new t.InvalidAddressError({address:o});return e.toLowerCase()===o.toLowerCase()}e.s(["isAddressEqual",()=>o])},755263,e=>{"use strict";var t=`{
  "connect_wallet": {
    "label": "Connect Wallet",
    "wrong_network": {
      "label": "Wrong network"
    }
  },

  "intro": {
    "title": "What is a Wallet?",
    "description": "A wallet is used to send, receive, store, and display digital assets. It's also a new way to log in, without needing to create new accounts and passwords on every website.",
    "digital_asset": {
      "title": "A Home for your Digital Assets",
      "description": "Wallets are used to send, receive, store, and display digital assets like Ethereum and NFTs."
    },
    "login": {
      "title": "A New Way to Log In",
      "description": "Instead of creating new accounts and passwords on every website, just connect your wallet."
    },
    "get": {
      "label": "Get a Wallet"
    },
    "learn_more": {
      "label": "Learn More"
    }
  },

  "sign_in": {
    "label": "Verify your account",
    "description": "To finish connecting, you must sign a message in your wallet to verify that you are the owner of this account.",
    "message": {
      "send": "Sign message",
      "preparing": "Preparing message...",
      "cancel": "Cancel",
      "preparing_error": "Error preparing message, please retry!"
    },
    "signature": {
      "waiting": "Waiting for signature...",
      "verifying": "Verifying signature...",
      "signing_error": "Error signing message, please retry!",
      "verifying_error": "Error verifying signature, please retry!",
      "oops_error": "Oops, something went wrong!"
    }
  },

  "connect": {
    "label": "Connect",
    "title": "Connect a Wallet",
    "new_to_ethereum": {
      "description": "New to Ethereum wallets?",
      "learn_more": {
        "label": "Learn More"
      }
    },
    "learn_more": {
      "label": "Learn more"
    },
    "recent": "Recent",
    "status": {
      "opening": "Opening %{wallet}...",
      "connecting": "Connecting",
      "connect_mobile": "Continue in %{wallet}",
      "not_installed": "%{wallet} is not installed",
      "not_available": "%{wallet} is not available",
      "confirm": "Confirm connection in the extension",
      "confirm_mobile": "Accept connection request in the wallet"
    },
    "secondary_action": {
      "get": {
        "description": "Don't have %{wallet}?",
        "label": "GET"
      },
      "install": {
        "label": "INSTALL"
      },
      "retry": {
        "label": "RETRY"
      }
    },
    "walletconnect": {
      "description": {
        "full": "Need the official WalletConnect modal?",
        "compact": "Need the WalletConnect modal?"
      },
      "open": {
        "label": "OPEN"
      }
    }
  },

  "connect_scan": {
    "title": "Scan with %{wallet}",
    "fallback_title": "Scan with your phone"
  },

  "connector_group": {
    "installed": "Installed",
    "recommended": "Recommended",
    "other": "Other",
    "popular": "Popular",
    "more": "More",
    "others": "Others"
  },

  "get": {
    "title": "Get a Wallet",
    "action": {
      "label": "GET"
    },
    "mobile": {
      "description": "Mobile Wallet"
    },
    "extension": {
      "description": "Browser Extension"
    },
    "mobile_and_extension": {
      "description": "Mobile Wallet and Extension"
    },
    "mobile_and_desktop": {
      "description": "Mobile and Desktop Wallet"
    },
    "looking_for": {
      "title": "Not what you're looking for?",
      "mobile": {
        "description": "Select a wallet on the main screen to get started with a different wallet provider."
      },
      "desktop": {
        "compact_description": "Select a wallet on the main screen to get started with a different wallet provider.",
        "wide_description": "Select a wallet on the left to get started with a different wallet provider."
      }
    }
  },

  "get_options": {
    "title": "Get started with %{wallet}",
    "short_title": "Get %{wallet}",
    "mobile": {
      "title": "%{wallet} for Mobile",
      "description": "Use the mobile wallet to explore the world of Ethereum.",
      "download": {
        "label": "Get the app"
      }
    },
    "extension": {
      "title": "%{wallet} for %{browser}",
      "description": "Access your wallet right from your favorite web browser.",
      "download": {
        "label": "Add to %{browser}"
      }
    },
    "desktop": {
      "title": "%{wallet} for %{platform}",
      "description": "Access your wallet natively from your powerful desktop.",
      "download": {
        "label": "Add to %{platform}"
      }
    }
  },

  "get_mobile": {
    "title": "Install %{wallet}",
    "description": "Scan with your phone to download on iOS or Android",
    "continue": {
      "label": "Continue"
    }
  },

  "get_instructions": {
    "mobile": {
      "connect": {
        "label": "Connect"
      },
      "learn_more": {
        "label": "Learn More"
      }
    },
    "extension": {
      "refresh": {
        "label": "Refresh"
      },
      "learn_more": {
        "label": "Learn More"
      }
    },
    "desktop": {
      "connect": {
        "label": "Connect"
      },
      "learn_more": {
        "label": "Learn More"
      }
    }
  },

  "chains": {
    "title": "Switch Networks",
    "wrong_network": "Wrong network detected, switch or disconnect to continue.",
    "confirm": "Confirm in Wallet",
    "switching_not_supported": "Your wallet does not support switching networks from %{appName}. Try switching networks from within your wallet instead.",
    "switching_not_supported_fallback": "Your wallet does not support switching networks from this app. Try switching networks from within your wallet instead.",
    "disconnect": "Disconnect",
    "connected": "Connected"
  },

  "profile": {
    "disconnect": {
      "label": "Disconnect"
    },
    "copy_address": {
      "label": "Copy Address",
      "copied": "Copied!"
    },
    "explorer": {
      "label": "View more on explorer"
    },
    "transactions": {
      "description": "%{appName} transactions will appear here...",
      "description_fallback": "Your transactions will appear here...",
      "recent": {
        "title": "Recent Transactions"
      },
      "clear": {
        "label": "Clear All"
      }
    }
  },

  "wallet_connectors": {
    "ready": {
      "qr_code": {
        "step1": {
          "description": "Add Ready to your home screen for faster access to your wallet.",
          "title": "Open the Ready app"
        },
        "step2": {
          "description": "Create a wallet and username, or import an existing wallet.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "berasig": {
      "extension": {
        "step1": {
          "title": "Install the BeraSig extension",
          "description": "We recommend pinning BeraSig to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "best": {
      "qr_code": {
        "step1": {
          "title": "Open the Best Wallet app",
          "description": "Add Best Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "bifrost": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bifrost Wallet on your home screen for quicker access.",
          "title": "Open the Bifrost Wallet app"
        },
        "step2": {
          "description": "Create or import a wallet using your recovery phrase.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "bitget": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bitget Wallet on your home screen for quicker access.",
          "title": "Open the Bitget Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Bitget Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Bitget Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "bitski": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Bitski to your taskbar for quicker access to your wallet.",
          "title": "Install the Bitski extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "bitverse": {
      "qr_code": {
        "step1": {
          "title": "Open the Bitverse Wallet app",
          "description": "Add Bitverse Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "bloom": {
      "desktop": {
        "step1": {
          "title": "Open the Bloom Wallet app",
          "description": "We recommend putting Bloom Wallet on your home screen for quicker access."
        },
        "step2": {
          "description": "Create or import a wallet using your recovery phrase.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you have a wallet, click on Connect to connect via Bloom. A connection prompt in the app will appear for you to confirm the connection.",
          "title": "Click on Connect"
        }
      }
    },

    "bybit": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bybit on your home screen for faster access to your wallet.",
          "title": "Open the Bybit app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "Click at the top right of your browser and pin Bybit Wallet for easy access.",
          "title": "Install the Bybit Wallet extension"
        },
        "step2": {
          "description": "Create a new wallet or import an existing one.",
          "title": "Create or Import a wallet"
        },
        "step3": {
          "description": "Once you set up Bybit Wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "binance": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Binance on your home screen for faster access to your wallet.",
          "title": "Open the Binance app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Binance Wallet extension",
          "description": "We recommend pinning Binance Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "coin98": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Coin98 Wallet on your home screen for faster access to your wallet.",
          "title": "Open the Coin98 Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },

      "extension": {
        "step1": {
          "description": "Click at the top right of your browser and pin Coin98 Wallet for easy access.",
          "title": "Install the Coin98 Wallet extension"
        },
        "step2": {
          "description": "Create a new wallet or import an existing one.",
          "title": "Create or Import a wallet"
        },
        "step3": {
          "description": "Once you set up Coin98 Wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "coinbase": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Coinbase Wallet on your home screen for quicker access.",
          "title": "Open the Coinbase Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using the cloud backup feature.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Coinbase Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Coinbase Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "compass": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Compass Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Compass Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "core": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Core on your home screen for faster access to your wallet.",
          "title": "Open the Core app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Core to your taskbar for quicker access to your wallet.",
          "title": "Install the Core extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "fox": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting FoxWallet on your home screen for quicker access.",
          "title": "Open the FoxWallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "frontier": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Frontier Wallet on your home screen for quicker access.",
          "title": "Open the Frontier Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Frontier Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Frontier Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "im_token": {
      "qr_code": {
        "step1": {
          "title": "Open the imToken app",
          "description": "Put imToken app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "iopay": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting ioPay on your home screen for faster access to your wallet.",
          "title": "Open the ioPay app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      }
    },

    "kaikas": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Kaikas to your taskbar for quicker access to your wallet.",
          "title": "Install the Kaikas extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Kaikas app",
          "description": "Put Kaikas app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "kaia": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Kaia to your taskbar for quicker access to your wallet.",
          "title": "Install the Kaia extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Kaia app",
          "description": "Put Kaia app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "kraken": {
      "qr_code": {
        "step1": {
          "title": "Open the Kraken Wallet app",
          "description": "Add Kraken Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "kresus": {
      "qr_code": {
        "step1": {
          "title": "Open the Kresus Wallet app",
          "description": "Add Kresus Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "magicEden": {
      "extension": {
        "step1": {
          "title": "Install the Magic Eden extension",
          "description": "We recommend pinning Magic Eden to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "metamask": {
      "qr_code": {
        "step1": {
          "title": "Open the MetaMask app",
          "description": "We recommend putting MetaMask on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the MetaMask extension",
          "description": "We recommend pinning MetaMask to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "nestwallet": {
      "extension": {
        "step1": {
          "title": "Install the NestWallet extension",
          "description": "We recommend pinning NestWallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "okx": {
      "qr_code": {
        "step1": {
          "title": "Open the OKX Wallet app",
          "description": "We recommend putting OKX Wallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the OKX Wallet extension",
          "description": "We recommend pinning OKX Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "omni": {
      "qr_code": {
        "step1": {
          "title": "Open the Omni app",
          "description": "Add Omni to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your home screen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "1inch": {
      "qr_code": {
        "step1": {
          "description": "Put 1inch Wallet on your home screen for faster access to your wallet.",
          "title": "Open the 1inch Wallet app"
        },
        "step2": {
          "description": "Create a wallet and username, or import an existing wallet.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "token_pocket": {
      "qr_code": {
        "step1": {
          "title": "Open the TokenPocket app",
          "description": "We recommend putting TokenPocket on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the TokenPocket extension",
          "description": "We recommend pinning TokenPocket to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "trust": {
      "qr_code": {
        "step1": {
          "title": "Open the Trust Wallet app",
          "description": "Put Trust Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the Trust Wallet extension",
          "description": "Click at the top right of your browser and pin Trust Wallet for easy access."
        },
        "step2": {
          "title": "Create or Import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up Trust Wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "uniswap": {
      "qr_code": {
        "step1": {
          "title": "Open the Uniswap app",
          "description": "Add Uniswap Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "zerion": {
      "qr_code": {
        "step1": {
          "title": "Open the Zerion app",
          "description": "We recommend putting Zerion on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the Zerion extension",
          "description": "We recommend pinning Zerion to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "rainbow": {
      "qr_code": {
        "step1": {
          "title": "Open the Rainbow app",
          "description": "We recommend putting Rainbow on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "You can easily backup your wallet using our backup feature on your phone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "enkrypt": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Enkrypt Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Enkrypt Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "frame": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Frame to your taskbar for quicker access to your wallet.",
          "title": "Install Frame & the companion extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "one_key": {
      "extension": {
        "step1": {
          "title": "Install the OneKey Wallet extension",
          "description": "We recommend pinning OneKey Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "paraswap": {
      "qr_code": {
        "step1": {
          "title": "Open the ParaSwap app",
          "description": "Add ParaSwap Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "phantom": {
      "extension": {
        "step1": {
          "title": "Install the Phantom extension",
          "description": "We recommend pinning Phantom to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "rabby": {
      "extension": {
        "step1": {
          "title": "Install the Rabby extension",
          "description": "We recommend pinning Rabby to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "ronin": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Ronin Wallet on your home screen for quicker access.",
          "title": "Open the Ronin Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Ronin Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Ronin Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "ramper": {
      "extension": {
        "step1": {
          "title": "Install the Ramper extension",
          "description": "We recommend pinning Ramper to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "safeheron": {
      "extension": {
        "step1": {
          "title": "Install the Core extension",
          "description": "We recommend pinning Safeheron to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "taho": {
      "extension": {
        "step1": {
          "title": "Install the Taho extension",
          "description": "We recommend pinning Taho to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "wigwam": {
      "extension": {
        "step1": {
          "title": "Install the Wigwam extension",
          "description": "We recommend pinning Wigwam to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "talisman": {
      "extension": {
        "step1": {
          "title": "Install the Talisman extension",
          "description": "We recommend pinning Talisman to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import an Ethereum Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "ctrl": {
      "extension": {
        "step1": {
          "title": "Install the CTRL Wallet extension",
          "description": "We recommend pinning CTRL Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "zeal": {
      "qr_code": {
        "step1": {
          "title": "Open the Zeal app",
          "description": "Add Zeal Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Zeal extension",
          "description": "We recommend pinning Zeal to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "safepal": {
      "extension": {
        "step1": {
          "title": "Install the SafePal Wallet extension",
          "description": "Click at the top right of your browser and pin SafePal Wallet for easy access."
        },
        "step2": {
          "title": "Create or Import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up SafePal Wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the SafePal Wallet app",
          "description": "Put SafePal Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "desig": {
      "extension": {
        "step1": {
          "title": "Install the Desig extension",
          "description": "We recommend pinning Desig to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "subwallet": {
      "extension": {
        "step1": {
          "title": "Install the SubWallet extension",
          "description": "We recommend pinning SubWallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the SubWallet app",
          "description": "We recommend putting SubWallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "clv": {
      "extension": {
        "step1": {
          "title": "Install the CLV Wallet extension",
          "description": "We recommend pinning CLV Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the CLV Wallet app",
          "description": "We recommend putting CLV Wallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "okto": {
      "qr_code": {
        "step1": {
          "title": "Open the Okto app",
          "description": "Add Okto to your home screen for quick access"
        },
        "step2": {
          "title": "Create an MPC Wallet",
          "description": "Create an account and generate a wallet"
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Tap the Scan QR icon at the top right and confirm the prompt to connect."
        }
      }
    },

    "ledger": {
      "desktop": {
        "step1": {
          "title": "Open the Ledger Live app",
          "description": "We recommend putting Ledger Live on your home screen for quicker access."
        },
        "step2": {
          "title": "Set up your Ledger",
          "description": "Set up a new Ledger or connect to an existing one."
        },
        "step3": {
          "title": "Connect",
          "description": "A connection prompt will appear for you to connect your wallet."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Ledger Live app",
          "description": "We recommend putting Ledger Live on your home screen for quicker access."
        },
        "step2": {
          "title": "Set up your Ledger",
          "description": "You can either sync with the desktop app or connect your Ledger."
        },
        "step3": {
          "title": "Scan the code",
          "description": "Tap WalletConnect then Switch to Scanner. After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "valora": {
      "qr_code": {
        "step1": {
          "title": "Open the Valora app",
          "description": "We recommend putting Valora on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "gate": {
      "qr_code": {
        "step1": {
          "title": "Open the Gate app",
          "description": "We recommend putting Gate on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Gate extension",
          "description": "We recommend pinning Gate to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "gemini": {
      "qr_code": {
        "step1": {
          "title": "Open keys.gemini.com",
          "description": "Visit keys.gemini.com on your mobile browser - no app download required."
        },
        "step2": {
          "title": "Create Your Wallet Instantly",
          "description": "Set up your smart wallet in seconds using your device's built-in authentication."
        },
        "step3": {
          "title": "Scan to Connect",
          "description": "Scan the QR code to instantly connect your wallet - it just works."
        }
      },
      "extension": {
        "step1": {
          "title": "Go to keys.gemini.com",
          "description": "No extensions or downloads needed - your wallet lives securely in the browser."
        },
        "step2": {
          "title": "One-Click Setup",
          "description": "Create your smart wallet instantly with passkey authentication - easier than any wallet out there."
        },
        "step3": {
          "title": "Connect and Go",
          "description": "Approve the connection and you're ready - the unopinionated wallet that just works."
        }
      }
    },

    "xportal": {
      "qr_code": {
        "step1": {
          "description": "Put xPortal on your home screen for faster access to your wallet.",
          "title": "Open the xPortal app"
        },
        "step2": {
          "description": "Create a wallet or import an existing one.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "mew": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting MEW Wallet on your home screen for quicker access.",
          "title": "Open the MEW Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using the cloud backup feature.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "zilpay": {
      "qr_code": {
        "step1": {
          "title": "Open the ZilPay app",
          "description": "Add ZilPay to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "nova": {
      "qr_code": {
        "step1": {
          "title": "Open the Nova Wallet app",
          "description": "Add Nova Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    }
  }
}
`;e.s(["en_US_default",()=>t])},297197,407065,706075,621490,766816,141942,86479,e=>{"use strict";var t=e.i(450323),r=e.i(557874),o=e.i(982191),s=e.i(839080);let a={block:(0,r.defineBlock)({format:e=>({transactions:e.transactions?.map(e=>{if("string"==typeof e)return e;let r=(0,o.formatTransaction)(e);return"0x7e"===r.typeHex&&(r.isSystemTx=e.isSystemTx,r.mint=e.mint?(0,t.hexToBigInt)(e.mint):void 0,r.sourceHash=e.sourceHash,r.type="deposit"),r}),stateRoot:e.stateRoot})}),transaction:(0,o.defineTransaction)({format(e){let r={};return"0x7e"===e.type&&(r.isSystemTx=e.isSystemTx,r.mint=e.mint?(0,t.hexToBigInt)(e.mint):void 0,r.sourceHash=e.sourceHash,r.type="deposit"),r}}),transactionReceipt:(0,s.defineTransactionReceipt)({format:e=>({l1GasPrice:e.l1GasPrice?(0,t.hexToBigInt)(e.l1GasPrice):null,l1GasUsed:e.l1GasUsed?(0,t.hexToBigInt)(e.l1GasUsed):null,l1Fee:e.l1Fee?(0,t.hexToBigInt)(e.l1Fee):null,l1FeeScalar:e.l1FeeScalar?Number(e.l1FeeScalar):null})})};e.s(["formatters",0,a],407065);var n=e.i(608861),i=e.i(796516),l=e.i(147526),c=e.i(675107),u=e.i(70326);e.s(["serializeTransaction",()=>q,"toYParitySignatureArray",()=>A],766816);var p=e.i(393702),h=e.i(94371),d=e.i(49810),m=e.i(883031),f=e.i(310538),y=e.i(8406);function w(e){if(!e||0===e.length)return[];let t=[];for(let r of e){let{contractAddress:e,chainId:o,nonce:s,...a}=r;t.push([(0,c.toHex)(o),e,(0,c.toHex)(s),...A({},a)])}return t}e.s(["serializeAuthorizationList",()=>w],706075);var b=e.i(556047),g=e.i(569934),x=e.i(86741),k=e.i(505880),v=e.i(853532),C=e.i(401319),W=e.i(790063);function I(e){let{chainId:t,maxPriorityFeePerGas:r,maxFeePerGas:o,to:s}=e;if(t<=0)throw new k.InvalidChainIdError({chainId:t});if(s&&!(0,i.isAddress)(s))throw new n.InvalidAddressError({address:s});if(o&&o>2n**256n-1n)throw new v.FeeCapTooHighError({maxFeePerGas:o});if(r&&o&&r>o)throw new v.TipAboveFeeCapError({maxFeePerGas:o,maxPriorityFeePerGas:r})}var P=e.i(576213);function O(e){if(!e||0===e.length)return[];let t=[];for(let r=0;r<e.length;r++){let{address:o,storageKeys:s}=e[r];for(let e=0;e<s.length;e++)if(s[e].length-2!=64)throw new p.InvalidStorageKeySizeError({storageKey:s[e]});if(!(0,i.isAddress)(o,{strict:!1}))throw new n.InvalidAddressError({address:o});t.push([o,s])}return t}function q(e,r){let o=(0,P.getTransactionType)(e);return"eip1559"===o?function(e,t){let{chainId:r,gas:o,nonce:s,to:a,value:n,maxFeePerGas:i,maxPriorityFeePerGas:p,accessList:h,data:d}=e;I(e);let m=O(h),f=[(0,c.toHex)(r),s?(0,c.toHex)(s):"0x",p?(0,c.toHex)(p):"0x",i?(0,c.toHex)(i):"0x",o?(0,c.toHex)(o):"0x",a??"0x",n?(0,c.toHex)(n):"0x",d??"0x",m,...A(e,t)];return(0,l.concatHex)(["0x02",(0,u.toRlp)(f)])}(e,r):"eip2930"===o?function(e,t){let{chainId:r,gas:o,data:s,nonce:a,to:p,value:h,accessList:d,gasPrice:m}=e;!function(e){let{chainId:t,maxPriorityFeePerGas:r,gasPrice:o,maxFeePerGas:s,to:a}=e;if(t<=0)throw new k.InvalidChainIdError({chainId:t});if(a&&!(0,i.isAddress)(a))throw new n.InvalidAddressError({address:a});if(r||s)throw new g.BaseError("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid EIP-2930 Transaction attribute.");if(o&&o>2n**256n-1n)throw new v.FeeCapTooHighError({maxFeePerGas:o})}(e);let f=O(d),y=[(0,c.toHex)(r),a?(0,c.toHex)(a):"0x",m?(0,c.toHex)(m):"0x",o?(0,c.toHex)(o):"0x",p??"0x",h?(0,c.toHex)(h):"0x",s??"0x",f,...A(e,t)];return(0,l.concatHex)(["0x01",(0,u.toRlp)(y)])}(e,r):"eip4844"===o?function(e,r){let{chainId:o,gas:s,nonce:a,to:n,value:i,maxFeePerBlobGas:p,maxFeePerGas:y,maxPriorityFeePerGas:w,accessList:g,data:k}=e;!function(e){let{blobVersionedHashes:r}=e;if(r){if(0===r.length)throw new x.EmptyBlobError;for(let e of r){let r=(0,C.size)(e),o=(0,t.hexToNumber)((0,W.slice)(e,0,1));if(32!==r)throw new x.InvalidVersionedHashSizeError({hash:e,size:r});if(o!==b.versionedHashVersionKzg)throw new x.InvalidVersionedHashVersionError({hash:e,version:o})}}I(e)}(e);let v=e.blobVersionedHashes,P=e.sidecars;if(e.blobs&&(void 0===v||void 0===P)){let t="string"==typeof e.blobs[0]?e.blobs:e.blobs.map(e=>(0,c.bytesToHex)(e)),r=e.kzg,o=(0,h.blobsToCommitments)({blobs:t,kzg:r});if(void 0===v&&(v=(0,m.commitmentsToVersionedHashes)({commitments:o})),void 0===P){let e=(0,d.blobsToProofs)({blobs:t,commitments:o,kzg:r});P=(0,f.toBlobSidecars)({blobs:t,commitments:o,proofs:e})}}let q=O(g),T=[(0,c.toHex)(o),a?(0,c.toHex)(a):"0x",w?(0,c.toHex)(w):"0x",y?(0,c.toHex)(y):"0x",s?(0,c.toHex)(s):"0x",n??"0x",i?(0,c.toHex)(i):"0x",k??"0x",q,p?(0,c.toHex)(p):"0x",v??[],...A(e,r)],S=[],R=[],B=[];if(P)for(let e=0;e<P.length;e++){let{blob:t,commitment:r,proof:o}=P[e];S.push(t),R.push(r),B.push(o)}return(0,l.concatHex)(["0x03",P?(0,u.toRlp)([T,S,R,B]):(0,u.toRlp)(T)])}(e,r):"eip7702"===o?function(e,t){let{authorizationList:r,chainId:o,gas:s,nonce:a,to:p,value:h,maxFeePerGas:d,maxPriorityFeePerGas:m,accessList:f,data:y}=e;!function(e){let{authorizationList:t}=e;if(t)for(let e of t){let{contractAddress:t,chainId:r}=e;if(!(0,i.isAddress)(t))throw new n.InvalidAddressError({address:t});if(r<=0)throw new k.InvalidChainIdError({chainId:r})}I(e)}(e);let b=O(f),g=w(r);return(0,l.concatHex)(["0x04",(0,u.toRlp)([(0,c.toHex)(o),a?(0,c.toHex)(a):"0x",m?(0,c.toHex)(m):"0x",d?(0,c.toHex)(d):"0x",s?(0,c.toHex)(s):"0x",p??"0x",h?(0,c.toHex)(h):"0x",y??"0x",b,g,...A(e,t)])])}(e,r):function(e,t){let{chainId:r=0,gas:o,data:s,nonce:a,to:l,value:h,gasPrice:d}=e;!function(e){let{chainId:t,maxPriorityFeePerGas:r,gasPrice:o,maxFeePerGas:s,to:a}=e;if(a&&!(0,i.isAddress)(a))throw new n.InvalidAddressError({address:a});if(void 0!==t&&t<=0)throw new k.InvalidChainIdError({chainId:t});if(r||s)throw new g.BaseError("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid Legacy Transaction attribute.");if(o&&o>2n**256n-1n)throw new v.FeeCapTooHighError({maxFeePerGas:o})}(e);let m=[a?(0,c.toHex)(a):"0x",d?(0,c.toHex)(d):"0x",o?(0,c.toHex)(o):"0x",l??"0x",h?(0,c.toHex)(h):"0x",s??"0x"];if(t){let e=(()=>{if(t.v>=35n)return(t.v-35n)/2n>0?t.v:27n+(35n===t.v?0n:1n);if(r>0)return BigInt(2*r)+BigInt(35n+t.v-27n);let e=27n+(27n===t.v?0n:1n);if(t.v!==e)throw new p.InvalidLegacyVError({v:t.v});return e})(),o=(0,y.trim)(t.r),s=(0,y.trim)(t.s);m=[...m,(0,c.toHex)(e),"0x00"===o?"0x":o,"0x00"===s?"0x":s]}else r>0&&(m=[...m,(0,c.toHex)(r),"0x","0x"]);return(0,u.toRlp)(m)}(e,r)}function A(e,t){let r=t??e,{v:o,yParity:s}=r;if(void 0===r.r||void 0===r.s||void 0===o&&void 0===s)return[];let a=(0,y.trim)(r.r),n=(0,y.trim)(r.s);return["number"==typeof s?s?(0,c.toHex)(1):"0x":0n===o?"0x":1n===o?(0,c.toHex)(1):27n===o?"0x":(0,c.toHex)(1),"0x00"===a?"0x":a,"0x00"===n?"0x":n]}function T(e,t){var r;return"deposit"===(r=e).type||void 0!==r.sourceHash?function(e){!function(e){let{from:t,to:r}=e;if(t&&!(0,i.isAddress)(t))throw new n.InvalidAddressError({address:t});if(r&&!(0,i.isAddress)(r))throw new n.InvalidAddressError({address:r})}(e);let{sourceHash:t,data:r,from:o,gas:s,isSystemTx:a,mint:p,to:h,value:d}=e,m=[t,o,h??"0x",p?(0,c.toHex)(p):"0x",d?(0,c.toHex)(d):"0x",s?(0,c.toHex)(s):"0x",a?"0x1":"0x",r??"0x"];return(0,l.concatHex)(["0x7e",(0,u.toRlp)(m)])}(e):q(e,t)}e.s(["serializeAccessList",()=>O],621490);let S={transaction:T};e.s(["serializeTransaction",()=>T,"serializers",0,S],141942);let R={contracts:{gasPriceOracle:{address:"0x420000000000000000000000000000000000000F"},l1Block:{address:"0x4200000000000000000000000000000000000015"},l2CrossDomainMessenger:{address:"0x4200000000000000000000000000000000000007"},l2Erc721Bridge:{address:"0x4200000000000000000000000000000000000014"},l2StandardBridge:{address:"0x4200000000000000000000000000000000000010"},l2ToL1MessagePasser:{address:"0x4200000000000000000000000000000000000016"}},formatters:a,serializers:S};e.s(["chainConfig",0,R],86479);let B=(0,e.i(538463).defineChain)({...R,id:8453,name:"Base",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:{default:{http:["https://mainnet.base.org"]}},blockExplorers:{default:{name:"Basescan",url:"https://basescan.org",apiUrl:"https://api.basescan.org/api"}},contracts:{...R.contracts,l2OutputOracle:{1:{address:"0x56315b90c40730925ec5485cf004d835058518A0"}},multicall3:{address:"0xca11bde05977b3631167028862be2a173976ca11",blockCreated:5022},portal:{1:{address:"0x49048044D57e1C92A77f79988d21Fa8fAF74E97e",blockCreated:0x10ac19f}},l1StandardBridge:{1:{address:"0x3154Cf16ccdb4C6d922629664174b904d80F2C35",blockCreated:0x10ac19f}}},sourceId:1});e.s(["base",0,B],297197)},1661,e=>{"use strict";e.i(247167);var t=e.i(843476),r=e.i(619273),o=e.i(540143),s=e.i(936553),a=e.i(88587),n=class extends a.Removable{constructor(e){super(),this.#e=!1,this.#t=e.defaultOptions,this.#r(e.options),this.#o=[],this.#s=e.cache,this.queryKey=e.queryKey,this.queryHash=e.queryHash,this.#a=e.state||function(e){let t="function"==typeof e.initialData?e.initialData():e.initialData,r=void 0!==t,o=r?"function"==typeof e.initialDataUpdatedAt?e.initialDataUpdatedAt():e.initialDataUpdatedAt:0;return{data:t,dataUpdateCount:0,dataUpdatedAt:r?o??Date.now():0,error:null,errorUpdateCount:0,errorUpdatedAt:0,fetchFailureCount:0,fetchFailureReason:null,fetchMeta:null,isInvalidated:!1,status:r?"success":"pending",fetchStatus:"idle"}}(this.options),this.state=this.#a,this.scheduleGc()}#a;#n;#s;#i;#l;#o;#t;#e;get meta(){return this.options.meta}#r(e){this.options={...this.#t,...e},this.updateGcTime(this.options.gcTime)}optionalRemove(){this.#o.length||"idle"!==this.state.fetchStatus||this.#s.remove(this)}setData(e,t){let o=(0,r.replaceData)(this.state.data,e,this.options);return this.#c({data:o,type:"success",dataUpdatedAt:t?.updatedAt,manual:t?.manual}),o}setState(e,t){this.#c({type:"setState",state:e,setStateOptions:t})}cancel(e){let t=this.#i;return this.#l?.cancel(e),t?t.then(r.noop).catch(r.noop):Promise.resolve()}destroy(){super.destroy(),this.cancel({silent:!0})}reset(){this.destroy(),this.setState(this.#a)}isActive(){return this.#o.some(e=>!1!==e.options.enabled)}isDisabled(){return this.getObserversCount()>0&&!this.isActive()}isStale(){return this.state.isInvalidated||!this.state.dataUpdatedAt||this.#o.some(e=>e.getCurrentResult().isStale)}isStaleByTime(e=0){return this.state.isInvalidated||!this.state.dataUpdatedAt||!(0,r.timeUntilStale)(this.state.dataUpdatedAt,e)}onFocus(){let e=this.#o.find(e=>e.shouldFetchOnWindowFocus());e?.refetch({cancelRefetch:!1}),this.#l?.continue()}onOnline(){let e=this.#o.find(e=>e.shouldFetchOnReconnect());e?.refetch({cancelRefetch:!1}),this.#l?.continue()}addObserver(e){this.#o.includes(e)||(this.#o.push(e),this.clearGcTimeout(),this.#s.notify({type:"observerAdded",query:this,observer:e}))}removeObserver(e){this.#o.includes(e)&&(this.#o=this.#o.filter(t=>t!==e),this.#o.length||(this.#l&&(this.#e?this.#l.cancel({revert:!0}):this.#l.cancelRetry()),this.scheduleGc()),this.#s.notify({type:"observerRemoved",query:this,observer:e}))}getObserversCount(){return this.#o.length}invalidate(){this.state.isInvalidated||this.#c({type:"invalidate"})}fetch(e,t){if("idle"!==this.state.fetchStatus){if(this.state.dataUpdatedAt&&t?.cancelRefetch)this.cancel({silent:!0});else if(this.#i)return this.#l?.continueRetry(),this.#i}if(e&&this.#r(e),!this.options.queryFn){let e=this.#o.find(e=>e.options.queryFn);e&&this.#r(e.options)}let r=new AbortController,o={queryKey:this.queryKey,meta:this.meta},a=e=>{Object.defineProperty(e,"signal",{enumerable:!0,get:()=>(this.#e=!0,r.signal)})};a(o);let n=()=>this.options.queryFn?(this.#e=!1,this.options.persister)?this.options.persister(this.options.queryFn,o,this):this.options.queryFn(o):Promise.reject(Error(`Missing queryFn: '${this.options.queryHash}'`)),i={fetchOptions:t,options:this.options,queryKey:this.queryKey,state:this.state,fetchFn:n};a(i),this.options.behavior?.onFetch(i,this),this.#n=this.state,("idle"===this.state.fetchStatus||this.state.fetchMeta!==i.fetchOptions?.meta)&&this.#c({type:"fetch",meta:i.fetchOptions?.meta});let l=e=>{(0,s.isCancelledError)(e)&&e.silent||this.#c({type:"error",error:e}),(0,s.isCancelledError)(e)||(this.#s.config.onError?.(e,this),this.#s.config.onSettled?.(this.state.data,e,this)),this.isFetchingOptimistic||this.scheduleGc(),this.isFetchingOptimistic=!1};return this.#l=(0,s.createRetryer)({fn:i.fetchFn,abort:r.abort.bind(r),onSuccess:e=>{void 0===e?l(Error(`${this.queryHash} data is undefined`)):(this.setData(e),this.#s.config.onSuccess?.(e,this),this.#s.config.onSettled?.(e,this.state.error,this),this.isFetchingOptimistic||this.scheduleGc(),this.isFetchingOptimistic=!1)},onError:l,onFail:(e,t)=>{this.#c({type:"failed",failureCount:e,error:t})},onPause:()=>{this.#c({type:"pause"})},onContinue:()=>{this.#c({type:"continue"})},retry:i.options.retry,retryDelay:i.options.retryDelay,networkMode:i.options.networkMode}),this.#i=this.#l.promise,this.#i}#c(e){let t=t=>{switch(e.type){case"failed":return{...t,fetchFailureCount:e.failureCount,fetchFailureReason:e.error};case"pause":return{...t,fetchStatus:"paused"};case"continue":return{...t,fetchStatus:"fetching"};case"fetch":return{...t,fetchFailureCount:0,fetchFailureReason:null,fetchMeta:e.meta??null,fetchStatus:(0,s.canFetch)(this.options.networkMode)?"fetching":"paused",...!t.dataUpdatedAt&&{error:null,status:"pending"}};case"success":return{...t,data:e.data,dataUpdateCount:t.dataUpdateCount+1,dataUpdatedAt:e.dataUpdatedAt??Date.now(),error:null,isInvalidated:!1,status:"success",...!e.manual&&{fetchStatus:"idle",fetchFailureCount:0,fetchFailureReason:null}};case"error":let r=e.error;if((0,s.isCancelledError)(r)&&r.revert&&this.#n)return{...this.#n,fetchStatus:"idle"};return{...t,error:r,errorUpdateCount:t.errorUpdateCount+1,errorUpdatedAt:Date.now(),fetchFailureCount:t.fetchFailureCount+1,fetchFailureReason:r,fetchStatus:"idle",status:"error"};case"invalidate":return{...t,isInvalidated:!0};case"setState":return{...t,...e.state}}};this.state=t(this.state),o.notifyManager.batch(()=>{this.#o.forEach(e=>{e.onQueryUpdate()}),this.#s.notify({query:this,type:"updated",action:e})})}},i=e.i(915823),l=class extends i.Subscribable{constructor(e={}){super(),this.config=e,this.#u=new Map}#u;build(e,t,o){let s=t.queryKey,a=t.queryHash??(0,r.hashQueryKeyByOptions)(s,t),i=this.get(a);return i||(i=new n({cache:this,queryKey:s,queryHash:a,options:e.defaultQueryOptions(t),state:o,defaultOptions:e.getQueryDefaults(s)}),this.add(i)),i}add(e){this.#u.has(e.queryHash)||(this.#u.set(e.queryHash,e),this.notify({type:"added",query:e}))}remove(e){let t=this.#u.get(e.queryHash);t&&(e.destroy(),t===e&&this.#u.delete(e.queryHash),this.notify({type:"removed",query:e}))}clear(){o.notifyManager.batch(()=>{this.getAll().forEach(e=>{this.remove(e)})})}get(e){return this.#u.get(e)}getAll(){return[...this.#u.values()]}find(e){let t={exact:!0,...e};return this.getAll().find(e=>(0,r.matchQuery)(t,e))}findAll(e={}){let t=this.getAll();return Object.keys(e).length>0?t.filter(t=>(0,r.matchQuery)(e,t)):t}notify(e){o.notifyManager.batch(()=>{this.listeners.forEach(t=>{t(e)})})}onFocus(){o.notifyManager.batch(()=>{this.getAll().forEach(e=>{e.onFocus()})})}onOnline(){o.notifyManager.batch(()=>{this.getAll().forEach(e=>{e.onOnline()})})}},c=e.i(114272),u=i,p=class extends u.Subscribable{constructor(e={}){super(),this.config=e,this.#p=[],this.#h=0}#p;#h;#d;build(e,t,r){let o=new c.Mutation({mutationCache:this,mutationId:++this.#h,options:e.defaultMutationOptions(t),state:r});return this.add(o),o}add(e){this.#p.push(e),this.notify({type:"added",mutation:e})}remove(e){this.#p=this.#p.filter(t=>t!==e),this.notify({type:"removed",mutation:e})}clear(){o.notifyManager.batch(()=>{this.#p.forEach(e=>{this.remove(e)})})}getAll(){return this.#p}find(e){let t={exact:!0,...e};return this.#p.find(e=>(0,r.matchMutation)(t,e))}findAll(e={}){return this.#p.filter(t=>(0,r.matchMutation)(e,t))}notify(e){o.notifyManager.batch(()=>{this.listeners.forEach(t=>{t(e)})})}resumePausedMutations(){return this.#d=(this.#d??Promise.resolve()).then(()=>{let e=this.#p.filter(e=>e.state.isPaused);return o.notifyManager.batch(()=>e.reduce((e,t)=>e.then(()=>t.continue().catch(r.noop)),Promise.resolve()))}).then(()=>{this.#d=void 0}),this.#d}},h=e.i(175555),d=e.i(814448);function m(e,{pages:t,pageParams:r}){let o=t.length-1;return e.getNextPageParam(t[o],t,r[o],r)}var f=class{#m;#f;#t;#y;#w;#b;#g;#x;constructor(e={}){this.#m=e.queryCache||new l,this.#f=e.mutationCache||new p,this.#t=e.defaultOptions||{},this.#y=new Map,this.#w=new Map,this.#b=0}mount(){this.#b++,1===this.#b&&(this.#g=h.focusManager.subscribe(()=>{h.focusManager.isFocused()&&(this.resumePausedMutations(),this.#m.onFocus())}),this.#x=d.onlineManager.subscribe(()=>{d.onlineManager.isOnline()&&(this.resumePausedMutations(),this.#m.onOnline())}))}unmount(){this.#b--,0===this.#b&&(this.#g?.(),this.#g=void 0,this.#x?.(),this.#x=void 0)}isFetching(e){return this.#m.findAll({...e,fetchStatus:"fetching"}).length}isMutating(e){return this.#f.findAll({...e,status:"pending"}).length}getQueryData(e){return this.#m.find({queryKey:e})?.state.data}ensureQueryData(e){let t=this.getQueryData(e.queryKey);return t?Promise.resolve(t):this.fetchQuery(e)}getQueriesData(e){return this.getQueryCache().findAll(e).map(({queryKey:e,state:t})=>[e,t.data])}setQueryData(e,t,o){let s=this.#m.find({queryKey:e}),a=s?.state.data,n=(0,r.functionalUpdate)(t,a);if(void 0===n)return;let i=this.defaultQueryOptions({queryKey:e});return this.#m.build(this,i).setData(n,{...o,manual:!0})}setQueriesData(e,t,r){return o.notifyManager.batch(()=>this.getQueryCache().findAll(e).map(({queryKey:e})=>[e,this.setQueryData(e,t,r)]))}getQueryState(e){return this.#m.find({queryKey:e})?.state}removeQueries(e){let t=this.#m;o.notifyManager.batch(()=>{t.findAll(e).forEach(e=>{t.remove(e)})})}resetQueries(e,t){let r=this.#m,s={type:"active",...e};return o.notifyManager.batch(()=>(r.findAll(e).forEach(e=>{e.reset()}),this.refetchQueries(s,t)))}cancelQueries(e={},t={}){let s={revert:!0,...t};return Promise.all(o.notifyManager.batch(()=>this.#m.findAll(e).map(e=>e.cancel(s)))).then(r.noop).catch(r.noop)}invalidateQueries(e={},t={}){return o.notifyManager.batch(()=>{if(this.#m.findAll(e).forEach(e=>{e.invalidate()}),"none"===e.refetchType)return Promise.resolve();let r={...e,type:e.refetchType??e.type??"active"};return this.refetchQueries(r,t)})}refetchQueries(e={},t){let s={...t,cancelRefetch:t?.cancelRefetch??!0};return Promise.all(o.notifyManager.batch(()=>this.#m.findAll(e).filter(e=>!e.isDisabled()).map(e=>{let t=e.fetch(void 0,s);return s.throwOnError||(t=t.catch(r.noop)),"paused"===e.state.fetchStatus?Promise.resolve():t}))).then(r.noop)}fetchQuery(e){let t=this.defaultQueryOptions(e);void 0===t.retry&&(t.retry=!1);let r=this.#m.build(this,t);return r.isStaleByTime(t.staleTime)?r.fetch(t):Promise.resolve(r.state.data)}prefetchQuery(e){return this.fetchQuery(e).then(r.noop).catch(r.noop)}fetchInfiniteQuery(e){var t;return t=e.pages,e.behavior={onFetch:(e,o)=>{let s=async()=>{let o,s=e.options,a=e.fetchOptions?.meta?.fetchMore?.direction,n=e.state.data?.pages||[],i=e.state.data?.pageParams||[],l=!1,c=e.options.queryFn||(()=>Promise.reject(Error(`Missing queryFn: '${e.options.queryHash}'`))),u=async(t,o,s)=>{if(l)return Promise.reject();if(null==o&&t.pages.length)return Promise.resolve(t);let a={queryKey:e.queryKey,pageParam:o,direction:s?"backward":"forward",meta:e.options.meta};Object.defineProperty(a,"signal",{enumerable:!0,get:()=>(e.signal.aborted?l=!0:e.signal.addEventListener("abort",()=>{l=!0}),e.signal)});let n=await c(a),{maxPages:i}=e.options,u=s?r.addToStart:r.addToEnd;return{pages:u(t.pages,n,i),pageParams:u(t.pageParams,o,i)}};if(a&&n.length){let e="backward"===a,t={pages:n,pageParams:i},r=(e?function(e,{pages:t,pageParams:r}){return e.getPreviousPageParam?.(t[0],t,r[0],r)}:m)(s,t);o=await u(t,r,e)}else{o=await u({pages:[],pageParams:[]},i[0]??s.initialPageParam);let e=t??n.length;for(let t=1;t<e;t++){let e=m(s,o);o=await u(o,e)}}return o};e.options.persister?e.fetchFn=()=>e.options.persister?.(s,{queryKey:e.queryKey,meta:e.options.meta,signal:e.signal},o):e.fetchFn=s}},this.fetchQuery(e)}prefetchInfiniteQuery(e){return this.fetchInfiniteQuery(e).then(r.noop).catch(r.noop)}resumePausedMutations(){return this.#f.resumePausedMutations()}getQueryCache(){return this.#m}getMutationCache(){return this.#f}getDefaultOptions(){return this.#t}setDefaultOptions(e){this.#t=e}setQueryDefaults(e,t){this.#y.set((0,r.hashKey)(e),{queryKey:e,defaultOptions:t})}getQueryDefaults(e){let t=[...this.#y.values()],o={};return t.forEach(t=>{(0,r.partialMatchKey)(e,t.queryKey)&&(o={...o,...t.defaultOptions})}),o}setMutationDefaults(e,t){this.#w.set((0,r.hashKey)(e),{mutationKey:e,defaultOptions:t})}getMutationDefaults(e){let t=[...this.#w.values()],o={};return t.forEach(t=>{(0,r.partialMatchKey)(e,t.mutationKey)&&(o={...o,...t.defaultOptions})}),o}defaultQueryOptions(e){if(e?._defaulted)return e;let t={...this.#t.queries,...e?.queryKey&&this.getQueryDefaults(e.queryKey),...e,_defaulted:!0};return t.queryHash||(t.queryHash=(0,r.hashQueryKeyByOptions)(t.queryKey,t)),void 0===t.refetchOnReconnect&&(t.refetchOnReconnect="always"!==t.networkMode),void 0===t.throwOnError&&(t.throwOnError=!!t.suspense),void 0===t.networkMode&&t.persister&&(t.networkMode="offlineFirst"),t}defaultMutationOptions(e){return e?._defaulted?e:{...this.#t.mutations,...e?.mutationKey&&this.getMutationDefaults(e.mutationKey),...e,_defaulted:!0}}clear(){this.#m.clear(),this.#f.clear()}},y=e.i(912598),w=e.i(574983),b=e.i(722652),g=e.i(103111),x=e.i(297197);let k=(0,b.getDefaultConfig)({appName:"Kerne Terminal",projectId:"647910767760c9828a53e139dec924aa",chains:[x.base],ssr:!0}),v=new f;function C({children:e}){return(0,t.jsx)(w.WagmiProvider,{config:k,children:(0,t.jsx)(y.QueryClientProvider,{client:v,children:(0,t.jsx)(b.RainbowKitProvider,{initialChain:x.base,theme:(0,g.darkTheme)({accentColor:"#ffffff",accentColorForeground:"#050505",borderRadius:"none",fontStack:"system",overlayBlur:"small"}),children:e})})})}e.s(["Providers",()=>C],1661)},427423,e=>{"use strict";var t=e.i(843476),r=e.i(363178);function o({children:e,...o}){return(0,t.jsx)(r.ThemeProvider,{...o,children:e})}e.s(["ThemeProvider",()=>o])},101139,e=>{e.v(t=>Promise.all(["static/chunks/26a2f765031d04cd.js"].map(t=>e.l(t))).then(()=>t(109963)))},625932,e=>{e.v(e=>Promise.resolve().then(()=>e(776267)))},66216,e=>{e.v(t=>Promise.all(["static/chunks/ea31dc77a64ae228.js","static/chunks/0194d4a436410713.js","static/chunks/41f7e45f65ec4568.js"].map(t=>e.l(t))).then(()=>t(477350)))},224814,e=>{e.v(t=>Promise.all(["static/chunks/85d86320b0a7eb24.js","static/chunks/0df482b30961666c.js"].map(t=>e.l(t))).then(()=>t(653806)))},470308,e=>{e.v(t=>Promise.all(["static/chunks/c12d76611705811c.js"].map(t=>e.l(t))).then(()=>t(915618)))},474683,e=>{e.v(t=>Promise.all(["static/chunks/8c6243193d571f3a.js"].map(t=>e.l(t))).then(()=>t(289329)))},381024,e=>{e.v(t=>Promise.all(["static/chunks/2c507c2521f12d29.js"].map(t=>e.l(t))).then(()=>t(607627)))},114544,e=>{e.v(t=>Promise.all(["static/chunks/e0ed2649d3073a5e.js"].map(t=>e.l(t))).then(()=>t(64871)))},199160,e=>{e.v(t=>Promise.all(["static/chunks/c06b74b32486f252.js"].map(t=>e.l(t))).then(()=>t(552117)))},458488,e=>{e.v(t=>Promise.all(["static/chunks/da56d9c35ae347ef.js"].map(t=>e.l(t))).then(()=>t(828419)))},945205,e=>{e.v(t=>Promise.all(["static/chunks/0bcbb46c5e3fdf25.js"].map(t=>e.l(t))).then(()=>t(216419)))},669023,e=>{e.v(t=>Promise.all(["static/chunks/f127eddbd265565e.js"].map(t=>e.l(t))).then(()=>t(739776)))},469689,e=>{e.v(t=>Promise.all(["static/chunks/864147b80873992f.js"].map(t=>e.l(t))).then(()=>t(356290)))},760813,e=>{e.v(t=>Promise.all(["static/chunks/1b12645ee8bc884b.js"].map(t=>e.l(t))).then(()=>t(252306)))},423705,e=>{e.v(t=>Promise.all(["static/chunks/a75d878f4f5f13a9.js"].map(t=>e.l(t))).then(()=>t(997708)))},736057,e=>{e.v(t=>Promise.all(["static/chunks/f5c6a72a7b227ff8.js"].map(t=>e.l(t))).then(()=>t(905405)))},917507,e=>{e.v(t=>Promise.all(["static/chunks/6323be2ba253054e.js"].map(t=>e.l(t))).then(()=>t(70881)))},82058,e=>{e.v(t=>Promise.all(["static/chunks/eb6ec9225ab8f4a4.js"].map(t=>e.l(t))).then(()=>t(945467)))},984221,e=>{e.v(t=>Promise.all(["static/chunks/e735df406043c439.js"].map(t=>e.l(t))).then(()=>t(657990)))},281312,e=>{e.v(t=>Promise.all(["static/chunks/a53900a82d8881ce.js"].map(t=>e.l(t))).then(()=>t(737224)))},581928,e=>{e.v(t=>Promise.all(["static/chunks/58f6b85793db030f.js"].map(t=>e.l(t))).then(()=>t(887256)))},784600,e=>{e.v(t=>Promise.all(["static/chunks/50482d5029b0c1eb.js"].map(t=>e.l(t))).then(()=>t(220519)))},290491,e=>{e.v(t=>Promise.all(["static/chunks/83a55f541159f125.js"].map(t=>e.l(t))).then(()=>t(162088)))},435239,e=>{e.v(t=>Promise.all(["static/chunks/f8ea650a7506bc8d.js"].map(t=>e.l(t))).then(()=>t(771650)))},917421,e=>{e.v(t=>Promise.all(["static/chunks/a09a24d366d50595.js"].map(t=>e.l(t))).then(()=>t(157677)))},391110,e=>{e.v(t=>Promise.all(["static/chunks/28abe5bdf71d034d.js"].map(t=>e.l(t))).then(()=>t(210006)))},442086,e=>{e.v(t=>Promise.all(["static/chunks/cdf4d277428d3411.js"].map(t=>e.l(t))).then(()=>t(67881)))},105872,e=>{e.v(t=>Promise.all(["static/chunks/fd55b5c44095d849.js"].map(t=>e.l(t))).then(()=>t(864976)))},271711,e=>{e.v(t=>Promise.all(["static/chunks/f20a5acf8b08ad4d.js"].map(t=>e.l(t))).then(()=>t(29311)))},567031,e=>{e.v(t=>Promise.all(["static/chunks/1d23d7bb99a3c6fd.js"].map(t=>e.l(t))).then(()=>t(75789)))},575685,e=>{e.v(t=>Promise.all(["static/chunks/e625a34073f9e963.js"].map(t=>e.l(t))).then(()=>t(786882)))},604414,e=>{e.v(t=>Promise.all(["static/chunks/1fbab4c19bf07056.js"].map(t=>e.l(t))).then(()=>t(352164)))},777210,e=>{e.v(t=>Promise.all(["static/chunks/bb7631c2e765bae5.js"].map(t=>e.l(t))).then(()=>t(745141)))},230454,e=>{e.v(t=>Promise.all(["static/chunks/febaee82fe46dd12.js"].map(t=>e.l(t))).then(()=>t(516267)))},80911,e=>{e.v(t=>Promise.all(["static/chunks/31312a55a741195b.js"].map(t=>e.l(t))).then(()=>t(138783)))},197615,e=>{e.v(t=>Promise.all(["static/chunks/000d5aaae1649753.js"].map(t=>e.l(t))).then(()=>t(540804)))},485284,e=>{e.v(t=>Promise.all(["static/chunks/3f89b7b695a6d7dc.js"].map(t=>e.l(t))).then(()=>t(303962)))},346977,e=>{e.v(t=>Promise.all(["static/chunks/98f04ecab8ba803d.js"].map(t=>e.l(t))).then(()=>t(370564)))},736033,e=>{e.v(t=>Promise.all(["static/chunks/07353aebad6bc3dc.js"].map(t=>e.l(t))).then(()=>t(472299)))},557289,e=>{e.v(t=>Promise.all(["static/chunks/12dab76068ded989.js"].map(t=>e.l(t))).then(()=>t(920685)))},649149,e=>{e.v(t=>Promise.all(["static/chunks/9b3f225083ef0a3d.js"].map(t=>e.l(t))).then(()=>t(418891)))},9974,e=>{e.v(t=>Promise.all(["static/chunks/bf12f4c1f32f80d6.js"].map(t=>e.l(t))).then(()=>t(761011)))},485155,e=>{e.v(t=>Promise.all(["static/chunks/0c91bd755a4f9dab.js"].map(t=>e.l(t))).then(()=>t(421618)))},759968,e=>{e.v(t=>Promise.all(["static/chunks/a197228ba3c59a4c.js"].map(t=>e.l(t))).then(()=>t(251012)))},38898,e=>{e.v(t=>Promise.all(["static/chunks/87d8b1e64f99f9aa.js"].map(t=>e.l(t))).then(()=>t(900368)))},822574,e=>{e.v(t=>Promise.all(["static/chunks/b8670320de73bd6e.js"].map(t=>e.l(t))).then(()=>t(248530)))},101716,e=>{e.v(t=>Promise.all(["static/chunks/0763922dc86777d7.js"].map(t=>e.l(t))).then(()=>t(839444)))},24530,e=>{e.v(t=>Promise.all(["static/chunks/6ccf8e284ca75052.js"].map(t=>e.l(t))).then(()=>t(723557)))},768769,e=>{e.v(t=>Promise.all(["static/chunks/f855adf781fbabb6.js"].map(t=>e.l(t))).then(()=>t(880804)))},667285,e=>{e.v(t=>Promise.all(["static/chunks/5e52b85b2272e504.js"].map(t=>e.l(t))).then(()=>t(804453)))},193126,e=>{e.v(t=>Promise.all(["static/chunks/d4398ab35b431f0d.js"].map(t=>e.l(t))).then(()=>t(973024)))},708036,e=>{e.v(t=>Promise.all(["static/chunks/102c06659c7540e5.js"].map(t=>e.l(t))).then(()=>t(481675)))},811338,e=>{e.v(t=>Promise.all(["static/chunks/d7d3a2be52dabc28.js"].map(t=>e.l(t))).then(()=>t(385710)))},321625,e=>{e.v(t=>Promise.all(["static/chunks/9c0b5f5ffab2a5bb.js"].map(t=>e.l(t))).then(()=>t(656395)))},345304,e=>{e.v(t=>Promise.all(["static/chunks/3ada4ad80b724a17.js"].map(t=>e.l(t))).then(()=>t(382042)))},738278,e=>{e.v(t=>Promise.all(["static/chunks/5894511f7316295f.js"].map(t=>e.l(t))).then(()=>t(619124)))},792872,e=>{e.v(t=>Promise.all(["static/chunks/e5d550b9732ab661.js"].map(t=>e.l(t))).then(()=>t(371659)))},226755,e=>{e.v(t=>Promise.all(["static/chunks/3f039b77c6180d48.js"].map(t=>e.l(t))).then(()=>t(446495)))},504937,e=>{e.v(t=>Promise.all(["static/chunks/e74d6a3a94fc6c26.js"].map(t=>e.l(t))).then(()=>t(156255)))},410758,e=>{e.v(t=>Promise.all(["static/chunks/b7eedf15854f081e.js"].map(t=>e.l(t))).then(()=>t(908254)))},886422,e=>{e.v(t=>Promise.all(["static/chunks/383937fef5e1ddb5.js"].map(t=>e.l(t))).then(()=>t(652860)))},274604,e=>{e.v(t=>Promise.all(["static/chunks/a8aa6ff78e82658e.js"].map(t=>e.l(t))).then(()=>t(505209)))},426975,e=>{e.v(t=>Promise.all(["static/chunks/6d71cfc1f7683d60.js"].map(t=>e.l(t))).then(()=>t(6938)))},106369,e=>{e.v(t=>Promise.all(["static/chunks/dce3f3842db52dbe.js"].map(t=>e.l(t))).then(()=>t(358134)))},507518,e=>{e.v(t=>Promise.all(["static/chunks/528cda09397ca281.js"].map(t=>e.l(t))).then(()=>t(221274)))},396057,e=>{e.v(t=>Promise.all(["static/chunks/a0342869754663ac.js"].map(t=>e.l(t))).then(()=>t(432867)))},192150,e=>{e.v(t=>Promise.all(["static/chunks/04f0d42768e79133.js"].map(t=>e.l(t))).then(()=>t(42941)))},703354,e=>{e.v(t=>Promise.all(["static/chunks/ce5d6995e254e19e.js"].map(t=>e.l(t))).then(()=>t(185157)))},422316,e=>{e.v(t=>Promise.all(["static/chunks/e9abab00795bfca8.js"].map(t=>e.l(t))).then(()=>t(460012)))},932219,e=>{e.v(t=>Promise.all(["static/chunks/3f8afd6e6837c4b6.js"].map(t=>e.l(t))).then(()=>t(467138)))},437039,e=>{e.v(t=>Promise.all(["static/chunks/17727e254efd0ba9.js"].map(t=>e.l(t))).then(()=>t(21043)))},31273,e=>{e.v(t=>Promise.all(["static/chunks/604c018433c5d66d.js"].map(t=>e.l(t))).then(()=>t(444733)))},812921,e=>{e.v(t=>Promise.all(["static/chunks/ba246cf12e0a4cd0.js"].map(t=>e.l(t))).then(()=>t(327052)))},93305,e=>{e.v(t=>Promise.all(["static/chunks/27282591893e9efa.js"].map(t=>e.l(t))).then(()=>t(823233)))},65212,e=>{e.v(t=>Promise.all(["static/chunks/aa612cb4451d0ce2.js"].map(t=>e.l(t))).then(()=>t(879917)))},961315,e=>{e.v(t=>Promise.all(["static/chunks/b45bf4586b657794.js"].map(t=>e.l(t))).then(()=>t(4245)))},588300,e=>{e.v(t=>Promise.all(["static/chunks/280b3e1534b10084.js"].map(t=>e.l(t))).then(()=>t(227574)))},782184,e=>{e.v(t=>Promise.all(["static/chunks/cb9c522bf9d1dc24.js"].map(t=>e.l(t))).then(()=>t(956007)))},20651,e=>{e.v(t=>Promise.all(["static/chunks/88be83e3fde7daca.js"].map(t=>e.l(t))).then(()=>t(150676)))},254566,e=>{e.v(t=>Promise.all(["static/chunks/8fdd0d89755b8508.js"].map(t=>e.l(t))).then(()=>t(164540)))},873830,e=>{e.v(t=>Promise.all(["static/chunks/7bd87e064f4afcf8.js"].map(t=>e.l(t))).then(()=>t(631690)))},554610,e=>{e.v(t=>Promise.all(["static/chunks/ba77a1136b640f8a.js"].map(t=>e.l(t))).then(()=>t(93227)))}]);
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,271502,e=>{"use strict";e.i(812207);var t=e.i(604148),i=e.i(654479);e.i(374576);var o=e.i(120119),r=e.i(56350);e.i(234051);var a=e.i(829389),s=e.i(401564),n=e.i(886259),l=e.i(960398),c=e.i(149454),w=e.i(227302),d=e.i(803468),p=e.i(221728),m=e.i(218454);let u={isUnsupportedChainView:()=>"UnsupportedChain"===p.RouterController.state.view||"SwitchNetwork"===p.RouterController.state.view&&p.RouterController.state.history.includes("UnsupportedChain"),async safeClose(){this.isUnsupportedChainView()||await m.SIWXUtil.isSIWXCloseDisabled()?d.ModalController.shake():d.ModalController.close()}};var h=e.i(82283),v=e.i(811424),g=e.i(639403);e.i(404041);var f=e.i(112699),b=e.i(645975),y=e.i(459088),C=t,k=e.i(592057);let x=k.css`
  :host {
    display: block;
    border-radius: clamp(0px, var(--wui-border-radius-l), 44px);
    box-shadow: 0 0 0 1px var(--wui-color-gray-glass-005);
    background-color: var(--wui-color-modal-bg);
    overflow: hidden;
  }

  :host([data-embedded='true']) {
    box-shadow:
      0 0 0 1px var(--wui-color-gray-glass-005),
      0px 4px 12px 4px var(--w3m-card-embedded-shadow-color);
  }
`,S=class extends C.LitElement{render(){return i.html`<slot></slot>`}};S.styles=[y.resetStyles,x],S=function(e,t,i,o){var r,a=arguments.length,s=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,i,s):r(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s}([(0,b.customElement)("wui-card")],S),e.i(62238);var R=t,E=e.i(851887),A=t;e.i(852634),e.i(839009),e.i(73944);let O=k.css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--wui-spacing-s);
    border-radius: var(--wui-border-radius-s);
    border: 1px solid var(--wui-color-dark-glass-100);
    box-sizing: border-box;
    background-color: var(--wui-color-bg-325);
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.25);
  }

  wui-flex {
    width: 100%;
  }

  wui-text {
    word-break: break-word;
    flex: 1;
  }

  .close {
    cursor: pointer;
  }

  .icon-box {
    height: 40px;
    width: 40px;
    border-radius: var(--wui-border-radius-3xs);
    background-color: var(--local-icon-bg-value);
  }
`;var T=function(e,t,i,o){var r,a=arguments.length,s=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,i,s):r(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let N=class extends A.LitElement{constructor(){super(...arguments),this.message="",this.backgroundColor="accent-100",this.iconColor="accent-100",this.icon="info"}render(){return this.style.cssText=`
      --local-icon-bg-value: var(--wui-color-${this.backgroundColor});
   `,i.html`
      <wui-flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <wui-flex columnGap="xs" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color=${this.iconColor} size="md" name=${this.icon}></wui-icon>
          </wui-flex>
          <wui-text variant="small-500" color="bg-350" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="bg-350"
          size="sm"
          name="close"
          @click=${this.onClose}
        ></wui-icon>
      </wui-flex>
    `}onClose(){E.AlertController.close()}};N.styles=[y.resetStyles,O],T([(0,o.property)()],N.prototype,"message",void 0),T([(0,o.property)()],N.prototype,"backgroundColor",void 0),T([(0,o.property)()],N.prototype,"iconColor",void 0),T([(0,o.property)()],N.prototype,"icon",void 0),N=T([(0,b.customElement)("wui-alertbar")],N);let W=k.css`
  :host {
    display: block;
    position: absolute;
    top: var(--wui-spacing-s);
    left: var(--wui-spacing-l);
    right: var(--wui-spacing-l);
    opacity: 0;
    pointer-events: none;
  }
`;var $=function(e,t,i,o){var r,a=arguments.length,s=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,i,s):r(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let P={info:{backgroundColor:"fg-350",iconColor:"fg-325",icon:"info"},success:{backgroundColor:"success-glass-reown-020",iconColor:"success-125",icon:"checkmark"},warning:{backgroundColor:"warning-glass-reown-020",iconColor:"warning-100",icon:"warningCircle"},error:{backgroundColor:"error-glass-reown-020",iconColor:"error-125",icon:"exclamationTriangle"}},I=class extends R.LitElement{constructor(){super(),this.unsubscribe=[],this.open=E.AlertController.state.open,this.onOpen(!0),this.unsubscribe.push(E.AlertController.subscribeKey("open",e=>{this.open=e,this.onOpen(!1)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{message:e,variant:t}=E.AlertController.state,o=P[t];return i.html`
      <wui-alertbar
        message=${e}
        backgroundColor=${o?.backgroundColor}
        iconColor=${o?.iconColor}
        icon=${o?.icon}
      ></wui-alertbar>
    `}onOpen(e){this.open?(this.animate([{opacity:0,transform:"scale(0.85)"},{opacity:1,transform:"scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: auto"):e||(this.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: none")}};I.styles=W,$([(0,r.state)()],I.prototype,"open",void 0),I=$([(0,b.customElement)("w3m-alertbar")],I);var U=t,L=e.i(820903),D=e.i(241845),j=e.i(436220),B=e.i(653157),z=t;let K=k.css`
  button {
    border-radius: var(--local-border-radius);
    color: var(--wui-color-fg-100);
    padding: var(--local-padding);
  }

  @media (max-width: 700px) {
    button {
      padding: var(--wui-spacing-s);
    }
  }

  button > wui-icon {
    pointer-events: none;
  }

  button:disabled > wui-icon {
    color: var(--wui-color-bg-300) !important;
  }

  button:disabled {
    background-color: transparent;
  }
`;var M=function(e,t,i,o){var r,a=arguments.length,s=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,i,s):r(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let H=class extends z.LitElement{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.icon="copy",this.iconColor="inherit"}render(){let e="lg"===this.size?"--wui-border-radius-xs":"--wui-border-radius-xxs",t="lg"===this.size?"--wui-spacing-1xs":"--wui-spacing-2xs";return this.style.cssText=`
    --local-border-radius: var(${e});
    --local-padding: var(${t});
`,i.html`
      <button ?disabled=${this.disabled}>
        <wui-icon color=${this.iconColor} size=${this.size} name=${this.icon}></wui-icon>
      </button>
    `}};H.styles=[y.resetStyles,y.elementStyles,y.colorStyles,K],M([(0,o.property)()],H.prototype,"size",void 0),M([(0,o.property)({type:Boolean})],H.prototype,"disabled",void 0),M([(0,o.property)()],H.prototype,"icon",void 0),M([(0,o.property)()],H.prototype,"iconColor",void 0),H=M([(0,b.customElement)("wui-icon-link")],H);var X=t;e.i(864380),e.i(912190);let V=k.css`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: var(--wui-spacing-xxs);
    gap: var(--wui-spacing-xxs);
    transition: all var(--wui-ease-out-power-1) var(--wui-duration-md);
    border-radius: var(--wui-border-radius-xxs);
  }

  wui-image {
    border-radius: 100%;
    width: var(--wui-spacing-xl);
    height: var(--wui-spacing-xl);
  }

  wui-icon-box {
    width: var(--wui-spacing-xl);
    height: var(--wui-spacing-xl);
  }

  button:hover {
    background-color: var(--wui-color-gray-glass-002);
  }

  button:active {
    background-color: var(--wui-color-gray-glass-005);
  }
`;var Y=function(e,t,i,o){var r,a=arguments.length,s=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,i,s):r(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let _=class extends X.LitElement{constructor(){super(...arguments),this.imageSrc=""}render(){return i.html`<button>
      ${this.imageTemplate()}
      <wui-icon size="xs" color="fg-200" name="chevronBottom"></wui-icon>
    </button>`}imageTemplate(){return this.imageSrc?i.html`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`:i.html`<wui-icon-box
      size="xxs"
      iconColor="fg-200"
      backgroundColor="fg-100"
      background="opaque"
      icon="networkPlaceholder"
    ></wui-icon-box>`}};_.styles=[y.resetStyles,y.elementStyles,y.colorStyles,V],Y([(0,o.property)()],_.prototype,"imageSrc",void 0),_=Y([(0,b.customElement)("wui-select")],_),e.i(630352),e.i(249536);var G=e.i(542904);let q=k.css`
  :host {
    height: 64px;
  }

  wui-text {
    text-transform: capitalize;
  }

  wui-flex.w3m-header-title {
    transform: translateY(0);
    opacity: 1;
  }

  wui-flex.w3m-header-title[view-direction='prev'] {
    animation:
      slide-down-out 120ms forwards var(--wui-ease-out-power-2),
      slide-down-in 120ms forwards var(--wui-ease-out-power-2);
    animation-delay: 0ms, 200ms;
  }

  wui-flex.w3m-header-title[view-direction='next'] {
    animation:
      slide-up-out 120ms forwards var(--wui-ease-out-power-2),
      slide-up-in 120ms forwards var(--wui-ease-out-power-2);
    animation-delay: 0ms, 200ms;
  }

  wui-icon-link[data-hidden='true'] {
    opacity: 0 !important;
    pointer-events: none;
  }

  @keyframes slide-up-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(3px);
      opacity: 0;
    }
  }

  @keyframes slide-up-in {
    from {
      transform: translateY(-3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-down-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(-3px);
      opacity: 0;
    }
  }

  @keyframes slide-down-in {
    from {
      transform: translateY(3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;var F=function(e,t,i,o){var r,a=arguments.length,s=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,i,s):r(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let J=["SmartSessionList"];function Q(){let e=p.RouterController.state.data?.connector?.name,t=p.RouterController.state.data?.wallet?.name,i=p.RouterController.state.data?.network?.name,o=t??e,r=c.ConnectorController.getConnectors(),a=1===r.length&&r[0]?.id==="w3m-email";return{Connect:`Connect ${a?"Email":""} Wallet`,Create:"Create Wallet",ChooseAccountName:void 0,Account:void 0,AccountSettings:void 0,AllWallets:"All Wallets",ApproveTransaction:"Approve Transaction",BuyInProgress:"Buy",ConnectingExternal:o??"Connect Wallet",ConnectingWalletConnect:o??"WalletConnect",ConnectingWalletConnectBasic:"WalletConnect",ConnectingSiwe:"Sign In",Convert:"Convert",ConvertSelectToken:"Select token",ConvertPreview:"Preview convert",Downloads:o?`Get ${o}`:"Downloads",EmailLogin:"Email Login",EmailVerifyOtp:"Confirm Email",EmailVerifyDevice:"Register Device",GetWallet:"Get a wallet",Networks:"Choose Network",OnRampProviders:"Choose Provider",OnRampActivity:"Activity",OnRampTokenSelect:"Select Token",OnRampFiatSelect:"Select Currency",Pay:"How you pay",Profile:void 0,SwitchNetwork:i??"Switch Network",SwitchAddress:"Switch Address",Transactions:"Activity",UnsupportedChain:"Switch Network",UpgradeEmailWallet:"Upgrade your Wallet",UpdateEmailWallet:"Edit Email",UpdateEmailPrimaryOtp:"Confirm Current Email",UpdateEmailSecondaryOtp:"Confirm New Email",WhatIsABuy:"What is Buy?",RegisterAccountName:"Choose name",RegisterAccountNameSuccess:"",WalletReceive:"Receive",WalletCompatibleNetworks:"Compatible Networks",Swap:"Swap",SwapSelectToken:"Select token",SwapPreview:"Preview swap",WalletSend:"Send",WalletSendPreview:"Review send",WalletSendSelectToken:"Select Token",WhatIsANetwork:"What is a network?",WhatIsAWallet:"What is a wallet?",ConnectWallets:"Connect wallet",ConnectSocials:"All socials",ConnectingSocial:L.AccountController.state.socialProvider?L.AccountController.state.socialProvider:"Connect Social",ConnectingMultiChain:"Select chain",ConnectingFarcaster:"Farcaster",SwitchActiveChain:"Switch chain",SmartSessionCreated:void 0,SmartSessionList:"Smart Sessions",SIWXSignMessage:"Sign In",PayLoading:"Payment in progress"}}let Z=class extends U.LitElement{constructor(){super(),this.unsubscribe=[],this.heading=Q()[p.RouterController.state.view],this.network=l.ChainController.state.activeCaipNetwork,this.networkImage=j.AssetUtil.getNetworkImage(this.network),this.showBack=!1,this.prevHistoryLength=1,this.view=p.RouterController.state.view,this.viewDirection="",this.headerText=Q()[p.RouterController.state.view],this.unsubscribe.push(D.AssetController.subscribeNetworkImages(()=>{this.networkImage=j.AssetUtil.getNetworkImage(this.network)}),p.RouterController.subscribeKey("view",e=>{setTimeout(()=>{this.view=e,this.headerText=Q()[e]},G.ConstantsUtil.ANIMATION_DURATIONS.HeaderText),this.onViewChange(),this.onHistoryChange()}),l.ChainController.subscribeKey("activeCaipNetwork",e=>{this.network=e,this.networkImage=j.AssetUtil.getNetworkImage(this.network)}))}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){return i.html`
      <wui-flex .padding=${this.getPadding()} justifyContent="space-between" alignItems="center">
        ${this.leftHeaderTemplate()} ${this.titleTemplate()} ${this.rightHeaderTemplate()}
      </wui-flex>
    `}onWalletHelp(){B.EventsController.sendEvent({type:"track",event:"CLICK_WALLET_HELP"}),p.RouterController.push("WhatIsAWallet")}async onClose(){await u.safeClose()}rightHeaderTemplate(){let e=h.OptionsController?.state?.features?.smartSessions;return"Account"===p.RouterController.state.view&&e?i.html`<wui-flex>
      <wui-icon-link
        icon="clock"
        @click=${()=>p.RouterController.push("SmartSessionList")}
        data-testid="w3m-header-smart-sessions"
      ></wui-icon-link>
      ${this.closeButtonTemplate()}
    </wui-flex> `:this.closeButtonTemplate()}closeButtonTemplate(){return i.html`
      <wui-icon-link
        icon="close"
        @click=${this.onClose.bind(this)}
        data-testid="w3m-header-close"
      ></wui-icon-link>
    `}titleTemplate(){let e=J.includes(this.view);return i.html`
      <wui-flex
        view-direction="${this.viewDirection}"
        class="w3m-header-title"
        alignItems="center"
        gap="xs"
      >
        <wui-text variant="paragraph-700" color="fg-100" data-testid="w3m-header-text"
          >${this.headerText}</wui-text
        >
        ${e?i.html`<wui-tag variant="main">Beta</wui-tag>`:null}
      </wui-flex>
    `}leftHeaderTemplate(){let{view:e}=p.RouterController.state,t="Connect"===e,o=h.OptionsController.state.enableEmbedded,r=h.OptionsController.state.enableNetworkSwitch;return"Account"===e&&r?i.html`<wui-select
        id="dynamic"
        data-testid="w3m-account-select-network"
        active-network=${(0,a.ifDefined)(this.network?.name)}
        @click=${this.onNetworks.bind(this)}
        imageSrc=${(0,a.ifDefined)(this.networkImage)}
      ></wui-select>`:this.showBack&&!("ApproveTransaction"===e||"ConnectingSiwe"===e||t&&o)?i.html`<wui-icon-link
        data-testid="header-back"
        id="dynamic"
        icon="chevronLeft"
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-link>`:i.html`<wui-icon-link
      data-hidden=${!t}
      id="dynamic"
      icon="helpCircle"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-link>`}onNetworks(){this.isAllowedNetworkSwitch()&&(B.EventsController.sendEvent({type:"track",event:"CLICK_NETWORKS"}),p.RouterController.push("Networks"))}isAllowedNetworkSwitch(){let e=l.ChainController.getAllRequestedCaipNetworks(),t=!!e&&e.length>1,i=e?.find(({id:e})=>e===this.network?.id);return t||!i}getPadding(){return this.heading?["l","2l","l","2l"]:["0","2l","0","2l"]}onViewChange(){let{history:e}=p.RouterController.state,t=G.ConstantsUtil.VIEW_DIRECTION.Next;e.length<this.prevHistoryLength&&(t=G.ConstantsUtil.VIEW_DIRECTION.Prev),this.prevHistoryLength=e.length,this.viewDirection=t}async onHistoryChange(){let{history:e}=p.RouterController.state,t=this.shadowRoot?.querySelector("#dynamic");e.length>1&&!this.showBack&&t?(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!0,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"})):e.length<=1&&this.showBack&&t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!1,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}onGoBack(){p.RouterController.goBack()}};Z.styles=q,F([(0,r.state)()],Z.prototype,"heading",void 0),F([(0,r.state)()],Z.prototype,"network",void 0),F([(0,r.state)()],Z.prototype,"networkImage",void 0),F([(0,r.state)()],Z.prototype,"showBack",void 0),F([(0,r.state)()],Z.prototype,"prevHistoryLength",void 0),F([(0,r.state)()],Z.prototype,"view",void 0),F([(0,r.state)()],Z.prototype,"viewDirection",void 0),F([(0,r.state)()],Z.prototype,"headerText",void 0),Z=F([(0,b.customElement)("w3m-header")],Z);var ee=t,et=t;e.i(383227);let ei=k.css`
  :host {
    display: flex;
    column-gap: var(--wui-spacing-s);
    align-items: center;
    padding: var(--wui-spacing-xs) var(--wui-spacing-m) var(--wui-spacing-xs) var(--wui-spacing-xs);
    border-radius: var(--wui-border-radius-s);
    border: 1px solid var(--wui-color-gray-glass-005);
    box-sizing: border-box;
    background-color: var(--wui-color-bg-175);
    box-shadow:
      0px 14px 64px -4px rgba(0, 0, 0, 0.15),
      0px 8px 22px -6px rgba(0, 0, 0, 0.15);

    max-width: 300px;
  }

  :host wui-loading-spinner {
    margin-left: var(--wui-spacing-3xs);
  }
`;var eo=function(e,t,i,o){var r,a=arguments.length,s=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,i,s):r(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let er=class extends et.LitElement{constructor(){super(...arguments),this.backgroundColor="accent-100",this.iconColor="accent-100",this.icon="checkmark",this.message="",this.loading=!1,this.iconType="default"}render(){return i.html`
      ${this.templateIcon()}
      <wui-text variant="paragraph-500" color="fg-100" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `}templateIcon(){return this.loading?i.html`<wui-loading-spinner size="md" color="accent-100"></wui-loading-spinner>`:"default"===this.iconType?i.html`<wui-icon size="xl" color=${this.iconColor} name=${this.icon}></wui-icon>`:i.html`<wui-icon-box
      size="sm"
      iconSize="xs"
      iconColor=${this.iconColor}
      backgroundColor=${this.backgroundColor}
      icon=${this.icon}
      background="opaque"
    ></wui-icon-box>`}};er.styles=[y.resetStyles,ei],eo([(0,o.property)()],er.prototype,"backgroundColor",void 0),eo([(0,o.property)()],er.prototype,"iconColor",void 0),eo([(0,o.property)()],er.prototype,"icon",void 0),eo([(0,o.property)()],er.prototype,"message",void 0),eo([(0,o.property)()],er.prototype,"loading",void 0),eo([(0,o.property)()],er.prototype,"iconType",void 0),er=eo([(0,b.customElement)("wui-snackbar")],er);let ea=k.css`
  :host {
    display: block;
    position: absolute;
    opacity: 0;
    pointer-events: none;
    top: 11px;
    left: 50%;
    width: max-content;
  }
`;var es=function(e,t,i,o){var r,a=arguments.length,s=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,i,s):r(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let en={loading:void 0,success:{backgroundColor:"success-100",iconColor:"success-100",icon:"checkmark"},error:{backgroundColor:"error-100",iconColor:"error-100",icon:"close"}},el=class extends ee.LitElement{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.open=v.SnackController.state.open,this.unsubscribe.push(v.SnackController.subscribeKey("open",e=>{this.open=e,this.onOpen()}))}disconnectedCallback(){clearTimeout(this.timeout),this.unsubscribe.forEach(e=>e())}render(){let{message:e,variant:t,svg:o}=v.SnackController.state,r=en[t],{icon:a,iconColor:s}=o??r??{};return i.html`
      <wui-snackbar
        message=${e}
        backgroundColor=${r?.backgroundColor}
        iconColor=${s}
        icon=${a}
        .loading=${"loading"===t}
      ></wui-snackbar>
    `}onOpen(){clearTimeout(this.timeout),this.open?(this.animate([{opacity:0,transform:"translateX(-50%) scale(0.85)"},{opacity:1,transform:"translateX(-50%) scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.timeout&&clearTimeout(this.timeout),v.SnackController.state.autoClose&&(this.timeout=setTimeout(()=>v.SnackController.hide(),2500))):this.animate([{opacity:1,transform:"translateX(-50%) scale(1)"},{opacity:0,transform:"translateX(-50%) scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"})}};el.styles=ea,es([(0,r.state)()],el.prototype,"open",void 0),el=es([(0,b.customElement)("w3m-snackbar")],el);var ec=t,ew=e.i(365801),ed=e.i(127031),ep=e.i(592279);let em=(0,ew.proxy)({message:"",open:!1,triggerRect:{width:0,height:0,top:0,left:0},variant:"shade"}),eu=(0,ep.withErrorBoundary)({state:em,subscribe:e=>(0,ew.subscribe)(em,()=>e(em)),subscribeKey:(e,t)=>(0,ed.subscribeKey)(em,e,t),showTooltip({message:e,triggerRect:t,variant:i}){em.open=!0,em.message=e,em.triggerRect=t,em.variant=i},hide(){em.open=!1,em.message="",em.triggerRect={width:0,height:0,top:0,left:0}}});e.i(443452);let eh=k.css`
  :host {
    pointer-events: none;
  }

  :host > wui-flex {
    display: var(--w3m-tooltip-display);
    opacity: var(--w3m-tooltip-opacity);
    padding: 9px var(--wui-spacing-s) 10px var(--wui-spacing-s);
    border-radius: var(--wui-border-radius-xxs);
    color: var(--wui-color-bg-100);
    position: fixed;
    top: var(--w3m-tooltip-top);
    left: var(--w3m-tooltip-left);
    transform: translate(calc(-50% + var(--w3m-tooltip-parent-width)), calc(-100% - 8px));
    max-width: calc(var(--w3m-modal-width) - var(--wui-spacing-xl));
    transition: opacity 0.2s var(--wui-ease-out-power-2);
    will-change: opacity;
  }

  :host([data-variant='shade']) > wui-flex {
    background-color: var(--wui-color-bg-150);
    border: 1px solid var(--wui-color-gray-glass-005);
  }

  :host([data-variant='shade']) > wui-flex > wui-text {
    color: var(--wui-color-fg-150);
  }

  :host([data-variant='fill']) > wui-flex {
    background-color: var(--wui-color-fg-100);
    border: none;
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
    color: var(--wui-color-bg-150);
  }

  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }
`;var ev=function(e,t,i,o){var r,a=arguments.length,s=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,i,s):r(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let eg=class extends ec.LitElement{constructor(){super(),this.unsubscribe=[],this.open=eu.state.open,this.message=eu.state.message,this.triggerRect=eu.state.triggerRect,this.variant=eu.state.variant,this.unsubscribe.push(eu.subscribe(e=>{this.open=e.open,this.message=e.message,this.triggerRect=e.triggerRect,this.variant=e.variant}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){this.dataset.variant=this.variant;let e=this.triggerRect.top,t=this.triggerRect.left;return this.style.cssText=`
    --w3m-tooltip-top: ${e}px;
    --w3m-tooltip-left: ${t}px;
    --w3m-tooltip-parent-width: ${this.triggerRect.width/2}px;
    --w3m-tooltip-display: ${this.open?"flex":"none"};
    --w3m-tooltip-opacity: ${+!!this.open};
    `,i.html`<wui-flex>
      <wui-icon data-placement="top" color="fg-100" size="inherit" name="cursor"></wui-icon>
      <wui-text color="inherit" variant="small-500">${this.message}</wui-text>
    </wui-flex>`}};eg.styles=[eh],ev([(0,r.state)()],eg.prototype,"open",void 0),ev([(0,r.state)()],eg.prototype,"message",void 0),ev([(0,r.state)()],eg.prototype,"triggerRect",void 0),ev([(0,r.state)()],eg.prototype,"variant",void 0),eg=ev([(0,b.customElement)("w3m-tooltip"),(0,b.customElement)("w3m-tooltip")],eg);var ef=t;let eb=k.css`
  :host {
    --prev-height: 0px;
    --new-height: 0px;
    display: block;
  }

  div.w3m-router-container {
    transform: translateY(0);
    opacity: 1;
  }

  div.w3m-router-container[view-direction='prev'] {
    animation:
      slide-left-out 150ms forwards ease,
      slide-left-in 150ms forwards ease;
    animation-delay: 0ms, 200ms;
  }

  div.w3m-router-container[view-direction='next'] {
    animation:
      slide-right-out 150ms forwards ease,
      slide-right-in 150ms forwards ease;
    animation-delay: 0ms, 200ms;
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px);
      opacity: 1;
    }
    to {
      transform: translateX(10px);
      opacity: 0;
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-10px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px);
      opacity: 1;
    }
    to {
      transform: translateX(-10px);
      opacity: 0;
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(10px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;var ey=function(e,t,i,o){var r,a=arguments.length,s=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,i,s):r(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let eC=class extends ef.LitElement{constructor(){super(),this.resizeObserver=void 0,this.prevHeight="0px",this.prevHistoryLength=1,this.unsubscribe=[],this.view=p.RouterController.state.view,this.viewDirection="",this.unsubscribe.push(p.RouterController.subscribeKey("view",e=>this.onViewChange(e)))}firstUpdated(){this.resizeObserver=new ResizeObserver(([e])=>{let t=`${e?.contentRect.height}px`;"0px"!==this.prevHeight&&(this.style.setProperty("--prev-height",this.prevHeight),this.style.setProperty("--new-height",t),this.style.animation="w3m-view-height 150ms forwards ease",this.style.height="auto"),setTimeout(()=>{this.prevHeight=t,this.style.animation="unset"},G.ConstantsUtil.ANIMATION_DURATIONS.ModalHeight)}),this.resizeObserver?.observe(this.getWrapper())}disconnectedCallback(){this.resizeObserver?.unobserve(this.getWrapper()),this.unsubscribe.forEach(e=>e())}render(){return i.html`<div class="w3m-router-container" view-direction="${this.viewDirection}">
      ${this.viewTemplate()}
    </div>`}viewTemplate(){switch(this.view){case"AccountSettings":return i.html`<w3m-account-settings-view></w3m-account-settings-view>`;case"Account":return i.html`<w3m-account-view></w3m-account-view>`;case"AllWallets":return i.html`<w3m-all-wallets-view></w3m-all-wallets-view>`;case"ApproveTransaction":return i.html`<w3m-approve-transaction-view></w3m-approve-transaction-view>`;case"BuyInProgress":return i.html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`;case"ChooseAccountName":return i.html`<w3m-choose-account-name-view></w3m-choose-account-name-view>`;case"Connect":default:return i.html`<w3m-connect-view></w3m-connect-view>`;case"Create":return i.html`<w3m-connect-view walletGuide="explore"></w3m-connect-view>`;case"ConnectingWalletConnect":return i.html`<w3m-connecting-wc-view></w3m-connecting-wc-view>`;case"ConnectingWalletConnectBasic":return i.html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`;case"ConnectingExternal":return i.html`<w3m-connecting-external-view></w3m-connecting-external-view>`;case"ConnectingSiwe":return i.html`<w3m-connecting-siwe-view></w3m-connecting-siwe-view>`;case"ConnectWallets":return i.html`<w3m-connect-wallets-view></w3m-connect-wallets-view>`;case"ConnectSocials":return i.html`<w3m-connect-socials-view></w3m-connect-socials-view>`;case"ConnectingSocial":return i.html`<w3m-connecting-social-view></w3m-connecting-social-view>`;case"Downloads":return i.html`<w3m-downloads-view></w3m-downloads-view>`;case"EmailLogin":return i.html`<w3m-email-login-view></w3m-email-login-view>`;case"EmailVerifyOtp":return i.html`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`;case"EmailVerifyDevice":return i.html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`;case"GetWallet":return i.html`<w3m-get-wallet-view></w3m-get-wallet-view>`;case"Networks":return i.html`<w3m-networks-view></w3m-networks-view>`;case"SwitchNetwork":return i.html`<w3m-network-switch-view></w3m-network-switch-view>`;case"Profile":return i.html`<w3m-profile-view></w3m-profile-view>`;case"SwitchAddress":return i.html`<w3m-switch-address-view></w3m-switch-address-view>`;case"Transactions":return i.html`<w3m-transactions-view></w3m-transactions-view>`;case"OnRampProviders":return i.html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`;case"OnRampActivity":return i.html`<w3m-onramp-activity-view></w3m-onramp-activity-view>`;case"OnRampTokenSelect":return i.html`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`;case"OnRampFiatSelect":return i.html`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`;case"UpgradeEmailWallet":return i.html`<w3m-upgrade-wallet-view></w3m-upgrade-wallet-view>`;case"UpdateEmailWallet":return i.html`<w3m-update-email-wallet-view></w3m-update-email-wallet-view>`;case"UpdateEmailPrimaryOtp":return i.html`<w3m-update-email-primary-otp-view></w3m-update-email-primary-otp-view>`;case"UpdateEmailSecondaryOtp":return i.html`<w3m-update-email-secondary-otp-view></w3m-update-email-secondary-otp-view>`;case"UnsupportedChain":return i.html`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`;case"Swap":return i.html`<w3m-swap-view></w3m-swap-view>`;case"SwapSelectToken":return i.html`<w3m-swap-select-token-view></w3m-swap-select-token-view>`;case"SwapPreview":return i.html`<w3m-swap-preview-view></w3m-swap-preview-view>`;case"WalletSend":return i.html`<w3m-wallet-send-view></w3m-wallet-send-view>`;case"WalletSendSelectToken":return i.html`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`;case"WalletSendPreview":return i.html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`;case"WhatIsABuy":return i.html`<w3m-what-is-a-buy-view></w3m-what-is-a-buy-view>`;case"WalletReceive":return i.html`<w3m-wallet-receive-view></w3m-wallet-receive-view>`;case"WalletCompatibleNetworks":return i.html`<w3m-wallet-compatible-networks-view></w3m-wallet-compatible-networks-view>`;case"WhatIsAWallet":return i.html`<w3m-what-is-a-wallet-view></w3m-what-is-a-wallet-view>`;case"ConnectingMultiChain":return i.html`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`;case"WhatIsANetwork":return i.html`<w3m-what-is-a-network-view></w3m-what-is-a-network-view>`;case"ConnectingFarcaster":return i.html`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`;case"SwitchActiveChain":return i.html`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`;case"RegisterAccountName":return i.html`<w3m-register-account-name-view></w3m-register-account-name-view>`;case"RegisterAccountNameSuccess":return i.html`<w3m-register-account-name-success-view></w3m-register-account-name-success-view>`;case"SmartSessionCreated":return i.html`<w3m-smart-session-created-view></w3m-smart-session-created-view>`;case"SmartSessionList":return i.html`<w3m-smart-session-list-view></w3m-smart-session-list-view>`;case"SIWXSignMessage":return i.html`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`;case"Pay":return i.html`<w3m-pay-view></w3m-pay-view>`;case"PayLoading":return i.html`<w3m-pay-loading-view></w3m-pay-loading-view>`}}onViewChange(e){eu.hide();let t=G.ConstantsUtil.VIEW_DIRECTION.Next,{history:i}=p.RouterController.state;i.length<this.prevHistoryLength&&(t=G.ConstantsUtil.VIEW_DIRECTION.Prev),this.prevHistoryLength=i.length,this.viewDirection=t,setTimeout(()=>{this.view=e},G.ConstantsUtil.ANIMATION_DURATIONS.ViewTransition)}getWrapper(){return this.shadowRoot?.querySelector("div")}};eC.styles=eb,ey([(0,r.state)()],eC.prototype,"view",void 0),ey([(0,r.state)()],eC.prototype,"viewDirection",void 0),eC=ey([(0,b.customElement)("w3m-router")],eC);let ek=k.css`
  :host {
    z-index: var(--w3m-z-index);
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: var(--wui-cover);
    transition: opacity 0.2s var(--wui-ease-out-power-2);
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
  }

  :host(.appkit-modal) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--w3m-modal-width);
    width: 100%;
    position: relative;
    animation: zoom-in 0.2s var(--wui-ease-out-power-2);
    animation-fill-mode: backwards;
    outline: none;
    transition:
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: border-radius, background-color;
  }

  :host(.appkit-modal) wui-card {
    max-width: 400px;
  }

  wui-card[shake='true'] {
    animation:
      zoom-in 0.2s var(--wui-ease-out-power-2),
      w3m-shake 0.5s var(--wui-ease-out-power-2);
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--wui-spacing-xxl) 0px;
    }
  }

  @media (max-width: 430px) {
    wui-flex {
      align-items: flex-end;
    }

    wui-card {
      max-width: 100%;
      border-bottom-left-radius: var(--local-border-bottom-mobile-radius);
      border-bottom-right-radius: var(--local-border-bottom-mobile-radius);
      border-bottom: none;
      animation: slide-in 0.2s var(--wui-ease-out-power-2);
    }

    wui-card[shake='true'] {
      animation:
        slide-in 0.2s var(--wui-ease-out-power-2),
        w3m-shake 0.5s var(--wui-ease-out-power-2);
    }
  }

  @keyframes zoom-in {
    0% {
      transform: scale(0.95) translateY(0);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes slide-in {
    0% {
      transform: scale(1) translateY(50px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes w3m-view-height {
    from {
      height: var(--prev-height);
    }
    to {
      height: var(--new-height);
    }
  }
`;var ex=function(e,t,i,o){var r,a=arguments.length,s=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,i,s):r(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let eS="scroll-lock";class eR extends t.LitElement{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.hasPrefetched=!1,this.enableEmbedded=h.OptionsController.state.enableEmbedded,this.open=d.ModalController.state.open,this.caipAddress=l.ChainController.state.activeCaipAddress,this.caipNetwork=l.ChainController.state.activeCaipNetwork,this.shake=d.ModalController.state.shake,this.filterByNamespace=c.ConnectorController.state.filterByNamespace,this.initializeTheming(),n.ApiController.prefetchAnalyticsConfig(),this.unsubscribe.push(d.ModalController.subscribeKey("open",e=>e?this.onOpen():this.onClose()),d.ModalController.subscribeKey("shake",e=>this.shake=e),l.ChainController.subscribeKey("activeCaipNetwork",e=>this.onNewNetwork(e)),l.ChainController.subscribeKey("activeCaipAddress",e=>this.onNewAddress(e)),h.OptionsController.subscribeKey("enableEmbedded",e=>this.enableEmbedded=e),c.ConnectorController.subscribeKey("filterByNamespace",e=>{this.filterByNamespace===e||l.ChainController.getAccountData(e)?.caipAddress||(n.ApiController.fetchRecommendedWallets(),this.filterByNamespace=e)}))}firstUpdated(){if(this.caipAddress){if(this.enableEmbedded){d.ModalController.close(),this.prefetch();return}this.onNewAddress(this.caipAddress)}this.open&&this.onOpen(),this.enableEmbedded&&this.prefetch()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return(this.style.cssText=`
      --local-border-bottom-mobile-radius: ${this.enableEmbedded?"clamp(0px, var(--wui-border-radius-l), 44px)":"0px"};
    `,this.enableEmbedded)?i.html`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?i.html`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return i.html` <wui-card
      shake="${this.shake}"
      data-embedded="${(0,a.ifDefined)(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(e){e.target===e.currentTarget&&await this.handleClose()}async handleClose(){await u.safeClose()}initializeTheming(){let{themeVariables:e,themeMode:t}=g.ThemeController.state,i=f.UiHelperUtil.getColorTheme(t);(0,y.initializeTheming)(e,i)}onClose(){this.open=!1,this.classList.remove("open"),this.onScrollUnlock(),v.SnackController.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add("open"),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){let e=document.createElement("style");e.dataset.w3m=eS,e.textContent=`
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `,document.head.appendChild(e)}onScrollUnlock(){let e=document.head.querySelector(`style[data-w3m="${eS}"]`);e&&e.remove()}onAddKeyboardListener(){this.abortController=new AbortController;let e=this.shadowRoot?.querySelector("wui-card");e?.focus(),window.addEventListener("keydown",t=>{if("Escape"===t.key)this.handleClose();else if("Tab"===t.key){let{tagName:i}=t.target;!i||i.includes("W3M-")||i.includes("WUI-")||e?.focus()}},this.abortController)}onRemoveKeyboardListener(){this.abortController?.abort(),this.abortController=void 0}async onNewAddress(e){let t=l.ChainController.state.isSwitchingNamespace,i=w.CoreHelperUtil.getPlainAddress(e);i||t?t&&i&&p.RouterController.goBack():d.ModalController.close(),await m.SIWXUtil.initializeIfEnabled(),this.caipAddress=e,l.ChainController.setIsSwitchingNamespace(!1)}onNewNetwork(e){let t=this.caipNetwork,i=t?.caipNetworkId?.toString(),o=t?.chainNamespace,r=e?.caipNetworkId?.toString(),a=e?.chainNamespace,n=i!==r,c=t?.name===s.ConstantsUtil.UNSUPPORTED_NETWORK_NAME,w="ConnectingExternal"===p.RouterController.state.view,m=!l.ChainController.getAccountData(e?.chainNamespace)?.caipAddress,u="UnsupportedChain"===p.RouterController.state.view,h=d.ModalController.state.open,v=!1;h&&!w&&(m?n&&(v=!0):u?v=!0:n&&o===a&&!c&&(v=!0)),v&&"SIWXSignMessage"!==p.RouterController.state.view&&p.RouterController.goBack(),this.caipNetwork=e}prefetch(){this.hasPrefetched||(n.ApiController.prefetch(),n.ApiController.fetchWalletsByPage({page:1}),this.hasPrefetched=!0)}}eR.styles=ek,ex([(0,o.property)({type:Boolean})],eR.prototype,"enableEmbedded",void 0),ex([(0,r.state)()],eR.prototype,"open",void 0),ex([(0,r.state)()],eR.prototype,"caipAddress",void 0),ex([(0,r.state)()],eR.prototype,"caipNetwork",void 0),ex([(0,r.state)()],eR.prototype,"shake",void 0),ex([(0,r.state)()],eR.prototype,"filterByNamespace",void 0);let eE=class extends eR{};eE=ex([(0,b.customElement)("w3m-modal")],eE);let eA=class extends eR{};eA=ex([(0,b.customElement)("appkit-modal")],eA),e.s(["AppKitModal",()=>eA,"W3mModal",()=>eE,"W3mModalBase",()=>eR],839010),e.s([],334570),e.i(334570),e.i(839010),e.s(["AppKitModal",()=>eA,"W3mModal",()=>eE,"W3mModalBase",()=>eR],271502)}]);
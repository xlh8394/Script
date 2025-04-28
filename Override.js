// Clash Verge Rev Script 配置
// 
// 规则集通用配置
const ruleProviderCommon = {
  "type": "http",
  "format": "text",
  "interval": 86400
};

// 策略组通用配置
const groupBaseOption = {
  "interval": 300,
  "url": "http://connectivitycheck.gstatic.com/generate_204",
  "max-failed-times": 3,
};

// 程序入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 覆盖通用配置
  config["mixed-port"] = "7890";
  config["clash-core"] = "mihomo";
  config["tcp-fast-open"] = true;
  config["udp-fallback-policy"] = "restricted";  // 限制UDP回退
  config["enable-process"] = true;  // 进程级流量监控
  config["tcp-concurrent"] = true;
  config["allow-lan"] = true;
  config["ipv6"] = false;
  config["log-level"] = "info";
  config["find-process-mode"] = "strict";
  config["global-client-fingerprint"] = "chrome";
  config["external-controller"] = "127.0.0.1:9090";
  config["external-ui"] = "ui";
  config["external-ui-url"] = "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip";

  // 覆盖 dns 配置
  config["dns"] = {
    "enable": true,
    "listen": "0.0.0.0:1053",
    "ipv6": false,
    "prefer-h3": true,  // 启用HTTP/3协议
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": [
      // 系统必要域名
      "+.lan", "+.local", "+.arpa",
      // 网络检测
      "+.msftconnecttest.com", "+.msftncsi.com",
      // 防泄漏关键过滤
      "+.stun.*", "stun.*.*", "+.stun.*.*.*",
      "+.ipcheck.*", "+.ip*.com", "+.dnsleak.*",
      "detectportal.firefox.com",
      "network-test.debian.org",
      "resolve-*.cloudfront.net",
      "*.ipify.org", "*.icanhazip.com",
      "*.whoami.akamai.net",
      // 中国CDN域名（防止误判）
      "*.qq.com", "*.taobao.com", "*.alicdn.com"
    ],
    "default-nameserver": [
      "tls://223.5.5.5:853",  // 阿里加密DNS
      "https://dns.alidns.com/dns-query",
      "system"
    ],
    "nameserver": [
      "https://1.1.1.1/dns-query?ct=application/dns-message",  // Cloudflare DoH
      "tls://8.8.4.4:853",  // Google DoT
      "quic://dns.adguard.com:853"  // QUIC协议
    ],
    "fallback": [
      "tls://1.0.0.1:853",
      "https://doh.opendns.com/dns-query",
      "tls://dns.google:853"
    ],
    "nameserver-policy": {
      "geosite:cn": ["tls://223.5.5.5:853", "system"],
      "geosite:category-games@cn": "system",  // 游戏直连
      "geosite:gfw": [
        "https://1.1.1.1/dns-query",
        "tls://8.8.4.4:853"
      ]
    },
    "fallback-filter": {
      "geoip": true,
      "geoip-code": "CN",
      "ipcidr": [
        "0.0.0.0/8", "10.0.0.0/8",
        "127.0.0.0/8", "172.16.0.0/12",
        "192.168.0.0/16"
      ]
    }
  };

  // 覆盖 geodata 配置
  config["geodata-mode"] = true;
  config["geox-url"] = {
    "geoip": "https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat",
    "geosite": "https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
    "mmdb": "https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country-lite.mmdb",
    "asn": "https://mirror.ghproxy.com/https://github.com/xishang0128/geoip/releases/download/latest/GeoLite2-ASN.mmdb"
  };

  // 覆盖 sniffer 配置
  config["sniffer"] = {
    "enable": true,
    "parse-pure-ip": true,
    "sniff": {
      "TLS": {
        "ports": ["443", "8443"]
      },
      "HTTP": {
        "ports": ["80", "8080-8880"],
        "override-destination": true
      },
      "QUIC": {
        "ports": ["443", "8443"]
      }
    }
  };

  // 覆盖 tun 配置
  config["tun"] = {
    "enable": true,
    "stack": "mixed",
    "dns-hijack": [
      "any:53",             // 劫持所有DNS端口
      "tcp://8.8.8.8:53",   // 拦截谷歌DNS
      "tcp://1.1.1.1:53",   // 拦截Cloudflare DNS
      "udp://9.9.9.9:53"    // 拦截Quad9 DNS
    ],
    "auto-route": true,
    "auto-detect-interface": true,
    "strict-route": true,   // 强制所有流量经过TUN
    "mtu": 9000,           // 优化吞吐量
    "endpoint-independent-nat": true
  };

  // 覆盖策略组
  config["proxy-groups"] = [
    {
      ...groupBaseOption,
      "name": "手动切换",
      "type": "select",
      "proxies": ["香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],
      "include-all": true,
      "icon": "https://github.com/clash-verge-rev/clash-verge-rev/raw/main/src-tauri/icons/icon.png"
    },
    {
      ...groupBaseOption,
      "name": "国外网站",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Global.png"
    },
    {
      ...groupBaseOption,
      "name": "国际媒体",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png"
    },
    {
      ...groupBaseOption,
      "name": "苹果服务",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple_1.png"
    },
    {
      ...groupBaseOption,
      "name": "微软服务",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png"
    },
    {
      ...groupBaseOption,
      "name": "谷歌服务",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google_Search.png"
    },
    {
      ...groupBaseOption,
      "name": "电报消息",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png"
    },
    {
      ...groupBaseOption,
      "name": "推特消息",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Twitter.png"
    },
    {
      ...groupBaseOption,
      "name": "Spotify",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],
      "icon": "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Spotify.png"
    },
    {
      ...groupBaseOption,
      "name": "AI",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],
      "icon": "https://raw.githubusercontent.com/Orz-3/mini/master/Color/OpenAI.png"
    },
    {
      ...groupBaseOption,
      "name": "游戏平台",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Game.png"
    },
    {
      ...groupBaseOption,
      "name": "Emby",
      "type": "select",
      "include-all": true,
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Emby.png"
    },
    {
      ...groupBaseOption,
      "name": "广告拦截",
      "type": "select",
      "proxies": ["REJECT", "DIRECT"],
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Advertising.png"
    },
    {
      ...groupBaseOption,
      "name": "兜底分流",
      "type": "select",
      "include-all": true,
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png"
    },
    // 地区分组
    {
      ...groupBaseOption,
      "name": "香港节点",
      "type": "url-test",
      "tolerance": 0,
      "include-all": true,
      "filter": "(?i)🇭🇰|香港|(\b(HK|Hong)\b)",
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png"
    },
    {
      ...groupBaseOption,
      "name": "美国节点",
      "type": "url-test",
      "tolerance": 0,
      "include-all": true,
      "filter": "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\b(US|United States)\b)",
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png"
    },
    {
      ...groupBaseOption,
      "name": "狮城节点",
      "type": "url-test",
      "tolerance": 0,
      "include-all": true,
      "filter": "(?i)🇸🇬|新加坡|狮|(\b(SG|Singapore)\b)",
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png"
    },
    {
      ...groupBaseOption,
      "name": "日本节点",
      "type": "url-test",
      "tolerance": 0,
      "include-all": true,
      "filter": "(?i)🇯🇵|日本|东京|(\b(JP|Japan)\b)",
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png"
    },
    {
      ...groupBaseOption,
      "name": "台湾节点",
      "type": "url-test",
      "tolerance": 0,
      "include-all": true,
      "filter": "(?i)🇨🇳|🇹🇼|台湾|Taipei|(\b(TW|Tai|Taiwan)\b)",
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png"
    }
  ];

  // 覆盖规则集
  config["rule-providers"] = {
    "AD": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Reject.list",
      "path": "./rule-providers/AD.list"
    },
    "Apple": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Apple.list",
      "path": "./rule-providers/Apple.list"
    },
    "Google": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Google.list",
      "path": "./rule-providers/Google.list"
    },
    "YouTube": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/YouTube.list",
      "path": "./rule-providers/YouTube.list"
    },
    "Telegram": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Telegram.list",
      "path": "./rule-providers/Telegram.list"
    },
    "Twitter": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Twitter.list",
      "path": "./rule-providers/Twitter.list"
    },
    "Steam": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Steam.list",
      "path": "./rule-providers/Steam.list"
    },
    "Epic": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Epic.list",
      "path": "./rule-providers/Epic.list"
    },
    "AI": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/AI.list",
      "path": "./rule-providers/AI.list"
    },
    "Copilot": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/Copilot/Copilot.list",
      "path": "./rule-providers/Copilot.list"
    },
    "Emby": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Emby.list",
      "path": "./rule-providers/Emby.list"
    },
    "Spotify": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Spotify.list",
      "path": "./rule-providers/Spotify.list"
    },
    "Bahamut": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Bahamut.list",
      "path": "./rule-providers/Bahamut.list"
    },
    "Netflix": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Netflix.list",
      "path": "./rule-providers/Netflix.list"
    },
    "Disney": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Disney.list",
      "path": "./rule-providers/Disney.list"
    },
    "PrimeVideo": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/PrimeVideo.list",
      "path": "./rule-providers/PrimeVideo.list"
    },
    "HBO": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/HBO.list",
      "path": "./rule-providers/HBO.list"
    },
    "OneDrive": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/OneDrive.list",
      "path": "./rule-providers/OneDrive.list"
    },
    "Github": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Github.list",
      "path": "./rule-providers/Github.list"
    },
    "Microsoft": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Microsoft.list",
      "path": "./rule-providers/Microsoft.list"
    },
    "Lan": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Lan.list",
      "path": "./rule-providers/Lan.list"
    },
    "ProxyGFW": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/ProxyGFW.list",
      "path": "./rule-providers/ProxyGFW.list"
    },
    "China": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/ChinaDomain.list",
      "path": "./rule-providers/China.list"
    },
    "DNS": {
      ...ruleProviderCommon,
     "behavior": "classical",
     "url": "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/DNS/DNS.list", 
     "path": "./rule-providers/DNS.list"
    
    }
  };

  // 覆盖规则
  config["rules"] = [
  // === 1. 优先拦截DNS泄漏检测 ===
    "RULE-SET,DNS,REJECT",
    "DOMAIN-KEYWORD,stun,REJECT",
    "DOMAIN-KEYWORD,webrtc,REJECT",
    "DOMAIN-SUFFIX,dnsleaktest.com,REJECT",
    "DOMAIN-SUFFIX,browserleaks.com,REJECT",
 // 自定义规则
    "DOMAIN-SUFFIX,aktv.top,Emby",
    "DOMAIN-SUFFIX,jd.com,DIRECT",
    "DOMAIN-SUFFIX,gwdang.com,DIRECT",
    "DOMAIN-SUFFIX,iqiyi.com,DIRECT",
    "DOMAIN-SUFFIX,cnpassport.youku.com,DIRECT",
    "DOMAIN-SUFFIX,user.anjuke.com,DIRECT",
    "DOMAIN-SUFFIX,live.fanmingming.cn,DIRECT",
    "DOMAIN-KEYWORD,carryz,Emby",
 // "DOMAIN-KEYWORD,carryz,DIRECT",
    "DOMAIN-SUFFIX,cdn.hinet.net,台湾节点",
    "DOMAIN-KEYWORD,aliz,Emby",
    "DOMAIN-SUFFIX,video.mytvsuper.xyz,Emby",
    "DOMAIN-SUFFIX,googleapis.com,AI",
    "DOMAIN-SUFFIX,gemini.google.com,AI",
    "DOMAIN-SUFFIX,sexbjcam.com,AI",
    "DOMAIN-SUFFIX,felo.me,AI",
    "DOMAIN-SUFFIX,i3belney.googlevideo.com,AI",
  // 其他规则
    "RULE-SET,AD,广告拦截",
    "RULE-SET,AI,AI",
    "RULE-SET,Copilot,AI",
    "RULE-SET,Apple,苹果服务",
    "RULE-SET,YouTube,谷歌服务",
    "RULE-SET,Google,谷歌服务",
    "RULE-SET,Telegram,电报消息",
    "RULE-SET,Twitter,推特消息",
    "RULE-SET,Steam,游戏平台",
    "RULE-SET,Epic,游戏平台",
    "RULE-SET,Emby,Emby",
    "RULE-SET,Spotify,Spotify",
    "RULE-SET,Bahamut,国际媒体",
    "RULE-SET,Netflix,国际媒体",
    "RULE-SET,Disney,国际媒体",
    "RULE-SET,PrimeVideo,国际媒体",
    "RULE-SET,HBO,国际媒体",
    "GEOSITE,onedrive,微软服务",
    "GEOSITE,github,国际媒体",
    "GEOSITE,microsoft,微软服务",
    "GEOSITE,gfw,国外网站",
    "GEOSITE,cn,DIRECT",
    "RULE-SET,China,DIRECT",
    "GEOIP,lan,DIRECT",
    "GEOIP,CN,DIRECT",
    "MATCH,兜底分流"
  ];

  // 返回修改后的配置
  return config;
}

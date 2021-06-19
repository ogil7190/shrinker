var ProxyLists = require("proxy-lists");
var fs = require("fs");
const ProxyVerifier = require("proxy-verifier");
const { sleep } = require("./utils");

(async () => {
  const proxies = [];

  ProxyLists.getProxies({
    protocols: ["socks5"],
    filterMode: "strict",
    anonymityLevels: ["elite", "anonymous"],
    countries: ["us", "ca", "uk", "au"],
  })
    .on("data", function (_proxies) {
      proxies.push(..._proxies);
    })
    .on("error", function (error) {
      console.log("error!");
    })
    .once("end", async function () {
      console.log("end!");

      let str = "";
      while (proxies.length > 0) {
        console.log(proxies.length);
        const proxyObj = proxies.shift();
        ProxyVerifier.testAll(proxyObj, function (error, result) {
          if (error) {
            console.log("error");
          } else {
            if (result.protocols.socks5 && result.protocols.socks5.ok) {
              console.log(result);
              const proxy = `socks5://${proxyObj.ipAddress}:${proxyObj.port}`;
              str = str + proxy + "\n";
            }
          }
        });
        await sleep(100);
      }
      await sleep(1000);
      fs.writeFileSync("collection.txt", str);
    });
})();

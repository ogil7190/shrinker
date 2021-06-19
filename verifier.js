const fs = require("fs");
const readline = require("readline");
const ProxyVerifier = require("proxy-verifier");
const { sleep } = require("./utils");

const proxySources = [
  { protocol: "socks5", file: "./proxy/0.txt" },
  { protocol: "socks5", file: "./proxy/3.txt" },
  { protocol: "socks5", file: "./proxy/6.txt" },
  { protocol: "socks4", file: "./proxy/1.txt" },
  { protocol: "socks4", file: "./proxy/4.txt" },
  { protocol: "socks4", file: "./proxy/7.txt" },
  { protocol: "http", file: "./proxy/2.txt" },
  { protocol: "http", file: "./proxy/5.txt" },
  { protocol: "http", file: "./proxy/8.txt" },
];

async function verify() {
  for (let i = 0; i < proxySources.length; i++) {
    let str = "";
    const outFile = proxySources[i].file.split(".txt")[0] + "_working.txt";
    console.log("Using Source", proxySources[i].file);

    const fileStream = fs.createReadStream(proxySources[i].file);
    const protocol = proxySources[i].protocol;
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const proxy = {
        ipAddress: line.split(":")[0],
        port: line.split(":")[1],
        protocol,
      };

      ProxyVerifier.testAll(proxy, function (error, result) {
        if (error) {
          console.log("error");
        } else {
          console.log(result);
          if (result.protocols[protocol].ok) {
            str = str + line + "\n";
          }
        }
      });
      await sleep(100);
    }

    await sleep(10 * 1000);
    fs.writeFileSync(outFile, str);
  }
}

verify();

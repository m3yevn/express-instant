const fs = require("fs");

const options = {};
const loadOptions = () => {
  for (let i = 2; i < process.argv.length; i = i + 2) {
    const optionKey = process.argv[i].split("--")[1];
    options[optionKey] = process.argv[i + 1];
  }
};

loadOptions();

let configs = JSON.parse(fs.readFileSync(__dirname + "/default.json", "utf-8"));
if (!!options["config-file"]) {
  fs.readFile(options["config-file"], "utf8", (err, data) => {
    if (err) {
      return console.error("Config file does not exist. Using default configs");
    }
    if (!data) {
      return console.error("Config file is empty. Using default configs");
    }
    return (configs = JSON.parse(data));
  });
}

const http = configs.https ? require("https") : require("http");
const url = require("url");
const server = http.createServer((req, res) => {
  // Routing
  const currentUrl = req.url.split("?")[0];
  const route = configs.routes[currentUrl];
  if (route) {
    const methodHandler = route[req.method];
    res.writeHead(
      methodHandler.status || 200,
      methodHandler.contentType || { "Content-Type": "text/plain" }
    );
    let response = methodHandler.res;
    const queryStrings = url.parse(req.url).query;
    const params = req.params;

    const queryMap = {};
    const queries = queryStrings.split("&");
    queries.forEach((query) => {
      const [key, value] = query.split("=");
      queryMap[key] = value;
    });

    Object.keys(queryMap).forEach((key) => {
      if (response.includes(`$query.${key}`)) {
        response = response.replaceAll(`$query.${key}`, queryMap[key]);
      }
    });
    console.log(params);

    res.end(response);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

server.listen(configs.port, () => {
  console.log(`Server is listening on ${configs.port}`);
});

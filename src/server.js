import fs from "fs";
import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import { signUp } from "./templates/signUp.js";
import { signIn } from "./templates/signIn.js";
import { health } from "./templates/health.js";
import { signUpValidator } from "./templates/validations/signUp.validator.js";
import { signInValidator } from "./templates/validations/signIn.validator.js";
import { configDotenv } from "dotenv";
import dbService from "./templates/services/dbService.js";

const options = {};
const loadOptions = () => {
  for (let i = 2; i < process.argv.length; i = i + 2) {
    const optionKey = process.argv[i].split("--")[1];
    options[optionKey] = process.argv[i + 1];
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES = {
  signUp: [signUpValidator, signUp],
  signIn: [signInValidator, signIn],
  health,
};

loadOptions();

let configs = JSON.parse(fs.readFileSync(__dirname + "/default.json", "utf-8"));
const configFile = options["config-file"] || process.env.EXPRESS_INSTANT_CONFIG;

if (configFile) {
  fs.readFile(configFile, "utf8", (err, data) => {
    if (err) {
      console.error("Config file does not exist. Using default configs");
      return startServer({ port: configs.port || 3000 });
    }
    if (!data) {
      console.error("Config file is empty. Using default configs");
      return startServer({ port: configs.port || 3000 });
    }
    configs = JSON.parse(data);
    return startServer({ port: configs.port || 3000 });
  });
}

function setUpFunction(functionHandler) {
  const wrap = (handler) => `return function handler(req, res) { ${handler} ;}`;
  const newFunction = new Function(wrap(functionHandler));
  return newFunction.call();
}

function setUpModule(moduleHandler) {
  const isExist = fs.existsSync(moduleHandler, "utf-8");
  if (!isExist) {
    return () => {};
  }
  const data = fs.readFileSync(moduleHandler, "utf-8");
  const wrap = `return ${data}`;
  const newFunction = new Function(wrap);
  return newFunction.call();
}

function setUpRouter(app, routes) {
  const router = express.Router();
  const setUpRouter = setUpRoutes(router, routes);
  return setUpRouter;
}

async function setUpImport(methodHandler) {
  const handlers = await import(methodHandler.import);
  if (handlers?.default) {
    return handlers?.default[methodHandler?.handler];
  }
  return handlers?.[methodHandler?.handler];
}

function setUpRoutes(app, routes) {
  Object.keys(routes).forEach((url) => {
    const methods = routes[url];
    Object.keys(methods).forEach(async (methodName) => {
      const methodFunctionName = methodName.toLowerCase();
      const methodHandler = methods[methodName];

      app[methodFunctionName](
        url,
        methodHandler?.type === "static"
          ? express.static(methodHandler?.dir)
          : methodHandler?.type === "routes"
          ? setUpRouter(app, methodHandler?.routes)
          : methodHandler?.type === "function"
          ? setUpFunction(methodHandler?.function)
          : methodHandler?.type === "module"
          ? setUpModule(methodHandler?.module)
          : methodHandler?.type === "import"
          ? await setUpImport(methodHandler)
          : methodHandler?.type === "template"
          ? TEMPLATES[methodHandler?.template]
          : (req, res) => {
              res.json(methods[methodName]);
            }
      );
    });
  });

  return app;
}

export async function startServer({ port }) {
  try {
    if (configs?.dotenv) {
      configDotenv();
    }
    if (configs?.mongoDB) {
      await dbService.createDB();
    }
    const app = express();

    if (configs?.bodyParser?.json) {
      app.use(bodyParser.json());
    }
    if (configs?.bodyParser?.urlencoded) {
      app.use(bodyParser.urlencoded(configs?.bodyParser?.urlencoded));
    }

    setUpRoutes(app, configs?.routes);

    app.use((err, req, res, next) => {
      console.error(err);
      res.status(err.status || 500).json({
        error: err.title || "SERVER_ERROR",
        message: err.message || "An unexpected error occurred.",
      });
    });

    const httpServer = app.listen(port, () => {
      console.log(`Server is listening on ${port}`);
    });

    return { httpServer, app };
  } catch (ex) {
    console.error("Server is failed to start.", ex);
  }
}

import path = require("path");
import {
  Engine, graphviz, GraphvizSync, graphvizSync, graphvizVersion,
} from "@hpcc-js/wasm";

const fs = require("fs");

export default class WasmServer {
  binary: any;

  sync: GraphvizSync;

  constructor(instance: any, syncObject: GraphvizSync) {
    this.binary = instance;
    this.sync = syncObject;
  }

  public static load(pathToWasm: string): Promise<WasmServer> {
    const wasmPath = path.resolve(__dirname, pathToWasm);
    return new Promise((resolve, reject) => {
      fs.readFile(wasmPath, (err:any, data:any) => {
        if (err) {
          reject(err);
          return;
        }
        const buf = new Uint8Array(data);
        graphvizSync(wasmPath, buf).then((syncObject) => {
          resolve(new WasmServer(buf, syncObject));
        });
      });
    });
  }

  public async graphvizVersion() {
    return graphvizVersion("dist/", this.binary);
  }

  public async render(dot: string, engine?: Engine) {
    return graphviz.layout(dot, "svg", engine, {
      wasmBinary: this.binary,
    });
  }

  public renderSync(dot: string, engine?: Engine) {
    return this.sync.layout(dot, "svg", engine);
  }
}

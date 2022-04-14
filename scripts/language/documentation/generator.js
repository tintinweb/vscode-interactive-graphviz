// eslint-disable-next-line import/no-extraneous-dependencies
const { parseString } = require("xml2js");
const fs = require("fs");
const { isString, get } = require("lodash");

const target = `${__dirname}/../../../src/language/documentation/documentation.ts`;

/* eslint-disable no-alert, no-console */
function generateDocumentation(outputFilePath) {
  console.log("Generate the Documentation file ...");

  fs.readFile(`${__dirname}/attributes.xml`, (err, data) => {
    // const s = data.toString().replace(/<html:a rel="attr">(.*)<\/html:a>/g, "$1");

    let s = data.toString().replace(/\t/g, "");
    s = s.toString().replace(/<html:a rel="\w+">([\w\s\d-.<>=/();&"]+)<\/html:a>/g, "$1");
    s = s.toString().replace(/<html:a rel="\w+">([\w\s\d-.<>=/();&"]+)<\/html:a>/g, "$1");
    s = s.toString().replace(/<html:span class="val">([\w\s\d-.<>=/();&"]+)<\/html:span>/g, "`$1`");
    s = s.toString().replace(/<html:code>([\w\s\d-.<>=/();&"]+)<\/html:code>/g, "`$1`");
    s = s.toString().replace(/<html:tt>([\w\s\d-.<>=/();&]+)<\/html:tt>/g, "$1");
    s = s.toString().replace(/<html:a href=".*">([\w\s\d-.<>=/();&"]+)<\/html:a>/g, "$1");

    parseString(s, (_, result) => {
      const types = {};
      result["xsd:schema"]["xsd:simpleType"].map((t) => {
        let r = get(t, "xsd:restriction[0]xsd:enumeration");
        if (r) {
          r = r.map((i) => i.$.value);
        }

        types[t.$.name] = {
          name: t.$.name,
          annotation: get(t, "xsd:annotation[0]xsd:documentation[0]html:p[0]"),
          restrictions: r,
        };
      });
      // console.dir(types);

      const attributes = result["xsd:schema"]["xsd:attribute"].map((t) => ({
        name: t.$.name,
        type: types[t.$.type] || t.$.type,
        default: t.$.default,
        desc: t["xsd:annotation"][0]["xsd:documentation"][0]["html:p"][0].trim(),

      }));
      // console.dir(attributes);

      const fails = attributes.filter((i) => !isString(i.desc));
      if (fails.length > 0) {
        console.error("Could not convert the following attributes to proper documentation:");
        console.dir(fails);
        throw new Error("fail!");
      }

      fs.writeFileSync(outputFilePath, `const documentation = ${JSON.stringify(attributes, null, 2)};\nexport default documentation;\n`);

      console.log(`Documentation generated at: ${outputFilePath}`);
    });
  });
}

generateDocumentation(target);

/**
 * @author github.com/tintinweb
 * @license GPLv3
 *
  * */

/** imports */
import { TextDecoder } from "text-encoding";
import * as vscode from "vscode";
import InteractiveWebviewGenerator from "./features/interactiveWebview";
import PreviewPanel from "./features/previewPanel";
import ColorProvider from "./language/ColorProvider";
import DotCompletionItemProvider from "./language/CompletionItemProvider";
import DotDocumentFormatter from "./language/DocumentFormatter";
import DotHoverProvider from "./language/HoverProvider";
import SymbolProvider from "./language/SymbolProvider";
import * as settings from "./settings";

const DOT = "cs";
const EXT = ".cs";
/** global vars */

/** classdecs */

/** funcdecs */

function fsm2Dot(src: string) : string {
  const begin = `
    digraph {
        layout="neato";
       
       graph [
           splines=true; 
           sep =`
           + ` 1;
           overlap = true      
       ];
       
       node [
           color = blue, 
           shape = circle
           width=1.6, 
           height=1.6, 
           //style=rounded,
       
           penwidth = 1,
           fontsize=20,
   
           margin = 0
           
           
       ];
       
       edge [
           color=green, 
           //minlen = 2,
           penwidth = 1.2,
           fontcolor=blue,
           fontsize="15pt",
           margin = 2,
           arrowhead = "none"
           len = 5
           
       ];


    `;
  const end = "}";

  const lines = src.split("\n");

  let out = ""; // begin + "\n";

  const states = new Map<string, [number, number, number]>();
  const groups = new Map<string, string[]>();

  let currentGroup = "Main";
  groups.set(currentGroup, []);

  const identifier = /[_a-zA-Z][_a-zA-Z0-9]*/g;
  const floatNumber = /[+-]?([0-9]*[.])?[0-9]+/g;
  const betweenBrackets = /\[ *(.*?) *\]/;
  const voidFunc = /void +[_a-zA-Z][_a-zA-Z0-9]*/g;
  const slash = /\/*/g;

  console.log("******************************Estados******************************");
  let i = 0;

  const sep = "";
  let dotCommands = "";
  // Buscar Dot

  for (; i < lines.length; i += 1) {
    if (lines[i].includes("#Dot")) {
      break;
    }
  }

  i++;

  for (; i < lines.length; i++) {
    // Finalizar Dot
    if (lines[i].includes("#EndDot")) {
      break;
    }
    // Quitar todos los / (comentarios)
    const command = lines[i].replace(slash, "");
    dotCommands += `${command}\n`;
  }

  console.log(`Dot Commands: \n${dotCommands}`);

  out = `${begin}\n${dotCommands}\n`;

  i++;

  // Buscar el inicio de los estados

  for (; i < lines.length; i++) {
    if (lines[i].includes("#States")) {
      break;
    }
  }

  i++;

  let firstState = "";
  let didSaveFirstState = false;

  let isSubroutine = 0;
  let isGroup = false;

  for (; i < lines.length; i++) {
    // Finalizar estados
    if (lines[i].includes("#EndStates")) {
      break;
    }

    if (lines[i].includes("#Subroutine")) {
      isSubroutine = 1;
      console.log("#Subroutine");
    }

    if (lines[i].includes("#Group")) {
      isGroup = true;
      isSubroutine = 1;
      console.log("#Group");
    }

    if (lines[i].includes("#EndGroup")) {
      isGroup = false;
      currentGroup = "Main";
      console.log("#EndGroup");
    }

    // is between brackets?
    var matches = lines[i].match(betweenBrackets);

    if (matches) {
      const state = matches[1];

      if (isGroup) {
        currentGroup = state;
        groups.set(currentGroup, []);
        isGroup = false;
      }

      // Agregar a la coleccion de estados
      groups.get(currentGroup)?.push(state);

      states.set(state, [i + 1, 0, isSubroutine]);
      console.log(`#Subroutine ${isSubroutine} ${state}`);
      isSubroutine = 0;

      if (!didSaveFirstState) {
        firstState = state;
        didSaveFirstState = true;
      }
    }
  }

  console.log(`Groups ${groups.get(currentGroup)?.toString()}`);

  i++;
  out += "\n";
  // Buscar mensajes
  for (; i < lines.length; i++) {
    if (lines[i].includes("#Messages")) {
      break;
    }
  }
  i++;

  // Armar mapa mensajes
  const messages = new Map<string, [string, string]>();

  // Guardar mensajes en el mapa
  for (; i < lines.length; i++) {
    // Finalizar mensajes
    if (lines[i].includes("#EndMessages")) {
      break;
    }

    if (lines[i] != "") {
      // const tokens = lines[i].split(":");

      const tokens = lines[i].match(identifier) ?? [];
      // console.log("Tokens");
      // console.log(tokens);

      if (tokens.length > 3) {
        // Si ya existe la relacion contraria de estados en el mapa
        // asignarla como segundo mensaje
        const invRel = `${tokens[3]}:${tokens[1]}`;
        if (messages.has(invRel)) {
          const msg = messages.get(invRel) ?? ["", ""];
          msg[1] = `${i + 1}. ${tokens[2]}`;

          messages.delete(invRel);

          messages.set(
            invRel,
            [msg[0], msg[1]],
          );
          continue;
        } else {
          messages.set(
            `${tokens[1]}:${tokens[3]}`,
            [`${i + 1}. ${tokens[2]}`, ""],
          );
        }
      }
    }
  }

  i++;

  // Buscar implementaciones de las funciones Estado
  for (; i < lines.length; i++) {
    // empieza con 'void identifier'?
    var matches = lines[i].match(voidFunc);

    if (matches) {
      const tokens = matches[0].match(identifier) ?? [];

      if (states.has(tokens[1])) {
        const value = states.get(tokens[1]) ?? [0, 0, 0];
        value[1] = i + 1;
        states.delete(tokens[1]);
        states.set(tokens[1], value);

        // console.log("matches " + (i+1) + ". " + tokens[1]);
      }
    }
  }

  let pen2 = ""; // ", penwidth = 2";
  let sub = ""; // ", peripheries=2";
  let lSub = "";
  let rSub = "";

  let dotted = ""; // "style = dotted";

  for (const [key, groupStates] of groups) {
    if (groupStates.length > 0) {
      out += `subgraph cluster_${key}{\nlabel = "${key}"
                color = gray 
                fontcolor = gray   
                margin = 30
                style = rounded
                `;
    }

    for (const index in groupStates) {
      const key = groupStates[index];
      const value = states.get(key) ?? [0, 0, 0];

      if (key == firstState) {
        pen2 = ", penwidth = 3";
      } else {
        pen2 = "";
      }

      if (value[2] == 1) {
        sub = ", peripheries=2";
        lSub = "[ ";
        rSub = " ]";
      } else {
        sub = "";
        lSub = "";
        rSub = "";
      }

      if (value[1] == 0) {
        dotted = " style = dotted ";
      } else {
        dotted = "";
      }
      out += `${key}[${dotted}label="(${value[0]})\\n\\n   ${lSub}${value[1]}. ${key}${rSub}   \\n\\n"${pen2}${sub}];\n`;
    }

    out += "};\n";
  }

  /*
    for (let [key, value] of states) {

        if (key == firstState) {
            pen2 = ", penwidth = 3";
        }
        else {
            pen2 = "";
        }

        if (value[2] == 1) {
            sub = ", peripheries=2";
            lSub = "[ ";
            rSub = " ]";
        }
        else {
            sub = "";
            lSub = "";
            rSub = "";
        }
        out += key + "[label=\"(" + value[0] + ")\\n\\n   " + lSub + value[1] + ". " + key + rSub + "   \\n\\n\"" + pen2 + sub + "];\n";

    }
*/

  out += "\n";
  // Procesar mensajes desde el mapa
  for (const [key, value] of messages) {
    const states = key.split(":");
    out += `${states[0]}  -> ${states[1]
    } [taillabel = "${value[0]}", headlabel="${value[1]}"];\n`;
  }

  out += end;
  console.log(out);
  return out;
}

function onActivate(context: vscode.ExtensionContext) {
  console.log("Activando el PLUG-IN");
  const graphvizView = new InteractiveWebviewGenerator(context);

  /* Document Events */

  vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document.languageId == DOT
      || event.document.fileName.trim().toLowerCase().endsWith(EXT)) {
      const panel = graphvizView.getPanel(event.document.uri);
      if (panel) {
        // panel.requestRender(event.document.getText());
        panel.requestRender(fsm2Dot(event.document.getText()));

        console.log("event.document.getText()");
        console.log(event.document.getText());
      }
    }
  }, null, context.subscriptions);

  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((doc) => {
    if (doc.languageId === settings.languageId
        || doc.fileName.trim().toLowerCase().endsWith(settings.fileExtension)) {
      const panel = graphvizView.getPanel(doc.uri);
      if (panel) {
        panel.requestRender(doc.getText());
      }
    }
  }));

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      if (doc.languageId !== settings.languageId) return;
      if (!settings.extensionConfig().get("openAutomatically")) return;

      vscode.commands.executeCommand("fsm-csharp-interactive-preview.preview.beside", {
        document: doc,
      });
    }),
  );

  /* commands */

  context.subscriptions.push(
    vscode.commands.registerCommand("fsm-csharp-interactive-preview.preview.beside", (a) => {
      // take document or string; default active editor if
      const args = a || {};
      const options : {
        document?: vscode.TextDocument,
        uri?: vscode.Uri,
        content?: string,
        // eslint-disable-next-line no-unused-vars
        callback?: (panel: PreviewPanel) => void,
        allowMultiplePanels?: boolean,
        title?: string,
        search?: any,
        displayColumn?: vscode.ViewColumn | {
          viewColumn: vscode.ViewColumn;
          preserveFocus?: boolean | undefined;
        }
      } = {
        document: args.document,
        uri: args.uri,
        content: args.content,
        callback: args.callback,
        allowMultiplePanels: args.allowMultiplePanels,
        title: args.title,
        search: args.search,
        displayColumn: args.displayColumn || {
          viewColumn: vscode.ViewColumn.Beside,
          preserveFocus: settings.extensionConfig().get("preserveFocus"),
        },
      };

      if (!options.content
        && !options.document
        && !options.uri
        && vscode.window.activeTextEditor?.document) {
        options.document = vscode.window.activeTextEditor.document;
      }

      if (!options.uri && options.document) {
        options.uri = options.document.uri;
      }

      if (typeof options.displayColumn === "object" && options.displayColumn.preserveFocus === undefined) {
        options.displayColumn.preserveFocus = settings.extensionConfig().get("preserveFocus"); // default to user settings
      }

      const execute = (o:any) => {
        graphvizView.revealOrCreatePreview(
          o.displayColumn,
          o.uri,
          o,
        )
          .then((webpanel : PreviewPanel) => {
            // trigger dot render on page load success
            // just in case webpanel takes longer to load, wait for page
            // to ping back and perform action
            // eslint-disable-next-line no-param-reassign
            webpanel.waitingForRendering = o.content;
            // eslint-disable-next-line no-param-reassign
            webpanel.search = o.search;

            // allow caller to handle messages by providing them with the newly created webpanel
            // e.g. caller can override webpanel.handleMessage = function(message){};
            if (o.callback) {
              o.callback(webpanel);
            }
          });
      };

      if (!options.content) {
        if (options.document) {
          // options.content = options.document.getText();
          options.content = fsm2Dot(options.document.getText());
        } else if (options.uri) {
          vscode.workspace.fs.readFile(options.uri)
            .then((data) => {
              const td = new TextDecoder();
              options.content = td.decode(data);
              execute(options);
            });
          return;
        } else {
          vscode.window.showErrorMessage("No content for previewing!");
        }
      }
      execute(options);
    }),
  );

  /* add. providers */

  if (settings.extensionConfig().codeCompletion.enable as boolean) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
      [settings.languageId],
      new DotCompletionItemProvider(context),
      "=",
      "[",
      "{",
      ":",
    ));
  }

  context.subscriptions.push(vscode.languages.registerColorProvider(
    [settings.languageId],
    new ColorProvider(),
  ));

  context.subscriptions.push(vscode.languages.registerHoverProvider(
    [settings.languageId],
    new DotHoverProvider(),
  ));

  const symProvider = new SymbolProvider();
  context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(
    [settings.languageId],
    symProvider,
  ));
  context.subscriptions.push(vscode.languages.registerRenameProvider(
    [settings.languageId],
    symProvider,
  ));
  context.subscriptions.push(vscode.languages.registerReferenceProvider(
    [settings.languageId],
    symProvider,
  ));
  context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(
    [settings.languageId],
    new DotDocumentFormatter(),
  ));
}

/* exports */
exports.activate = onActivate;

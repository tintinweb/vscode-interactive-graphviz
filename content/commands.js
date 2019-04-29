var vscode = null;
try {
    vscode = acquireVsCodeApi();
}catch(error){
    console.error(error);
    // swallow, so in the script can be tested in a browser
}


function postMessage(message) {
    if (vscode) vscode.postMessage(message);
}

function receiveMessage(event)
{
    console.log(event)
}
window.addEventListener("message", receiveMessage, false);





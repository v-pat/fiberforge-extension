
import { ChildProcess, ExecException } from 'child_process';
import * as vscode from 'vscode';
const util = require('util');
const exec = util.promisify(require('child_process').exec);



// Function to install Go based on OS
async function installGo() {
    const platform = process.platform;
    let promise;
    try {
        switch (platform) {
            case 'win32':
                promise = await exec(`curl -o go.tar.gz https://go.dev/dl/go1.22.1.src.tar.gz && tar -C /c/ -xzf go.tar.gz && cd /c/go/src && ./make.bat && cd /c/go && ./bin/go install && setx PATH "%PATH%;C:\Go\bin"`);
                break;
            case 'darwin':
                promise = await exec(`curl -o go.tar.gz https://go.dev/dl/go1.22.1.src.tar.gz && tar -C /usr/local -xzf go.tar.gz && cd /usr/local/go/src && ./make.bash && cd /usr/local/go && ./bin/go install && export PATH="$PATH:/usr/local/go/bin"`);
                break;
            case 'linux':
                promise = await exec(`curl -o go.tar.gz https://go.dev/dl/go1.22.1.src.tar.gz && tar -C /usr/local -xzf go.tar.gz && cd /usr/local/go/src && ./make.bash && cd /usr/local/go && ./bin/go install && export PATH="$PATH:/usr/local/go/bin"`);
                break;
            default:
                vscode.window.showErrorMessage("Operating system is not supported.");
                break;
        }
        return promise;
    } catch (error:any) {
        vscode.window.showErrorMessage("Unable to install go : " + promise?.error?.message);
        return null;
    }
}

async function runSetup() {
    const os = process.platform;
    let command = await checkFiberForgeVersion();
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found.");
        return;
    }

    const name = await vscode.window.showInputBox({ placeHolder: "Enter your project name" });
    if (!name) {
        vscode.window.showErrorMessage("Name is required.");
        return;
    }

    const dbName = await vscode.window.showInputBox({ placeHolder: "Enter database name", prompt: "Available databases are mongodb, mysql and postgres." });
    if (!dbName) {
        vscode.window.showErrorMessage("Database name is required.");
        return;
    }


    const terminal = vscode.window.createTerminal({
        name: "FiberForge Setup",
        cwd: workspaceFolder.uri.fsPath // Run the command in the workspace folder
    });
    terminal.sendText(`${command} fiberforge setup --name="${name}" --db="${dbName}"`);
    terminal.show();
}

async function runGenerate() {
    const os = process.platform;

    let command = await checkFiberForgeVersion();

    // Show file picker dialog to select config file
    const configFileUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
            'Text files': ['txt'],
            'JSON files': ['json']
        }
    });

    if (!configFileUri || configFileUri.length === 0) {
        vscode.window.showErrorMessage("No config file selected.");
        return;
    }

    const configFilePath = configFileUri[0].fsPath;

    const terminal = vscode.window.createTerminal({
        name: "FiberForge Generate",
        cwd: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined // Run the command in the workspace root directory if available
    });

    terminal.sendText(`${command} fiberforge generate "${configFilePath}"`);
    terminal.show();
}

async function checkFiberForgeVersion() {
    try {
        const { stdout, stderr } = await exec('fiberforge -v');
        return ""
    } catch (error: any) {
        return "go install github.com/v-pat/fiberforge@v0.0.7 &&";
    }
}

export function activate(context: vscode.ExtensionContext) {

    let disposableSetup = vscode.commands.registerCommand('fiberforge.setup', async () => {

        try {
            const { stdout, stderr } = await exec('go version');
            runSetup();
        } catch (error: any) {
            vscode.window.showWarningMessage('FiberForge requires Go installed to run commands. Do you want to install it?', 'Yes', 'No').then(async (selection) => {
                if (selection === 'Yes') {
                    let promise = await installGo();
                    if(promise){
                        runSetup();
                    }else{
                        return;
                    }
                } else {
                    vscode.window.showErrorMessage("FiberForge requires Go installed to run commands. Please install Go manually and try again.");
                }
            });
        }

    });

    context.subscriptions.push(disposableSetup);

    let disposableGenerate = vscode.commands.registerCommand('fiberforge.generate', async () => {

        try {
            const { stdout, stderr } = await exec('go version');
            runGenerate();
        } catch (error) {
            vscode.window.showWarningMessage('FiberForge requires Go installed to run commands. Do you want to install it?', 'Yes', 'No').then(async (selection) => {
                if (selection === 'Yes') {
                    let promise = await installGo();
                    if (promise) {
                        runGenerate();
                    }else{
                        return;
                    }
                } else {
                    vscode.window.showErrorMessage("FiberForge requires Go installed to run commands. Please install Go and try again.");
                }
            });
        }

    });

    context.subscriptions.push(disposableGenerate);
}
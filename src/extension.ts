
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
                await installChocolateyIfNot();
                promise = await exec('choco install golang');
                break;
            case 'darwin':
                await installBrewIfNot();
                promise = await exec('brew install golang');
                break;
            case 'linux':
                promise = await exec('sudo apt-get install golang-go');
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



async function installChocolateyIfNot() {
    try{
        const {stderr,stdout} = await exec(`choco -v`);
    }catch(error:any){
        try{
            const {stderr,stdout} = await exec(`@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"`);
        }catch(error:any){
            vscode.window.showErrorMessage("Unable to install chocolatey package manager for windows. Please install golang and try again.");
        }
    }
    
}

async function installBrewIfNot() {
    try{
        const {stderr,stdout} = await exec(`which brew`);
    }catch(error:any){
        try{
            const {stderr,stdout} = await exec(`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`);
        }catch(error:any){
            vscode.window.showErrorMessage("Unable to install hombrew package manager for macOS. Please install golang and try again.");
        }
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

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    let disposableSetup = vscode.commands.registerCommand('fiberforge.setup', async () => {

        const os = process.platform;

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

        let command;
        if (os === 'win32') {
            command = `curl -LJO https://github.com/v-pat/fiberforge/releases/latest/download/fiberforge.exe && fiberforge.exe setup --name="${name}" --db="${dbName}" && del fiberforge.exe`;
        } else if (os === 'darwin' || os === 'linux') {
           command = `curl -LO https://github.com/v-pat/fiberforge/releases/latest/download/fiberforge && chmod +x fiberforge && ./fiberforge setup --name="${name}" --db="${dbName}" && rm fiberforge`;
        } else {
            vscode.window.showErrorMessage("Operating system is not supported.");
            return;
        }


        const terminal = vscode.window.createTerminal({
            name: "FiberForge Setup",
            cwd: workspaceFolder.uri.fsPath // Run the command in the workspace folder
        });
        terminal.sendText(command);
        terminal.show();
    });

    context.subscriptions.push(disposableSetup);

    let disposableGenerate = vscode.commands.registerCommand('fiberforge.generate', async () => {

        const os = process.platform;
        

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

        let command;
        if (os === 'win32') {
            command = `curl -LJO https://github.com/v-pat/fiberforge/releases/latest/download/fiberforge.exe && fiberforge.exe generate ${configFilePath} && del fiberforge.exe`;
        } else if (os === 'darwin' || os === 'linux') {
           command = `curl -LO https://github.com/v-pat/fiberforge/releases/latest/download/fiberforge && chmod +x fiberforge && ./fiberforge generate ${configFilePath} && rm fiberforge`;
        } else {
            vscode.window.showErrorMessage("Operating system is not supported.");
            return;
        }


        const terminal = vscode.window.createTerminal({
            name: "FiberForge Generate",
            cwd: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined // Run the command in the workspace root directory if available
        });
        terminal.sendText(command);
        terminal.show();
    });

    context.subscriptions.push(disposableGenerate);
}

import * as vscode from 'vscode';
import * as path from 'path';
import * as child_process from 'child_process';

export function activate(context: vscode.ExtensionContext) {

    let disposableSetup = vscode.commands.registerCommand('fiberforge.setup', async () => {
        const extensionAssetsPath = context.asAbsolutePath('assets');
        const fiberforgePath = path.join(extensionAssetsPath, 'fiberforge.exe');

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

        const dbName = await vscode.window.showInputBox({ placeHolder: "Enter database name" ,prompt:"Available databases are mongodb, mysql and postgres."});
        if (!dbName) {
            vscode.window.showErrorMessage("Database name is required.");
            return;
        }

        const command = `"${fiberforgePath}" setup --name="${name}" --db="${dbName}"`;

        const terminal = vscode.window.createTerminal({
            name: "FiberForge Setup",
            cwd: workspaceFolder.uri.fsPath // Run the command in the workspace folder
        });
        terminal.sendText(command);
        terminal.show();
    });

    context.subscriptions.push(disposableSetup);

    let disposableGenerate = vscode.commands.registerCommand('fiberforge.generate', async () => {
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

        const extensionAssetsPath = context.asAbsolutePath('assets');
        const fiberforgePath = path.join(extensionAssetsPath, 'fiberforge.exe');

        const command = `"${fiberforgePath}" generate "${configFilePath}"`;

        const terminal = vscode.window.createTerminal({
            name: "FiberForge Generate",
            cwd: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined // Run the command in the workspace root directory if available
        });
        terminal.sendText(command);
        terminal.show();
    });

    context.subscriptions.push(disposableGenerate);
}
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';

// Helper function to activate the extension
function activateExtension() {
	vscode.extensions.getExtension('fiberforge')?.activate();
}

// Helper function to join paths (mocked version)
function mockPathJoin(...paths: string[]): string {
	return paths.join(path.sep);
}

suite('FiberForge Extension Tests', async () => {
	let originalShowErrorMessage: (message: string) => Thenable<string | undefined>;
	let messageFromShowErrorMessage: string | undefined;

	suiteSetup(() => {
		// Stub vscode.window.showErrorMessage to capture the error message
		originalShowErrorMessage = vscode.window.showErrorMessage;
		vscode.window.showErrorMessage = (message: string) => {
			messageFromShowErrorMessage = message;
			return Promise.resolve(undefined);
		};
	});

	suiteTeardown(() => {
		// Restore vscode.window.showErrorMessage
		vscode.window.showErrorMessage = originalShowErrorMessage;
	});

	test('Setup Command Success', async () => {
		activateExtension();
		// Mock user input
		const mockName = 'TestApp';
		const mockDbName = 'mysql';

		// Stub vscode.window.showInputBox to provide mock values
		vscode.window.showInputBox = (options?: vscode.InputBoxOptions) => {
			if (options?.prompt === 'Enter your name:') {
				return Promise.resolve(mockName);
			} else if (options?.prompt === 'Enter database name:') {
				return Promise.resolve(mockDbName);
			} else {
				return Promise.reject(new Error('Unexpected prompt'));
			}
		};


		let setupCommandCalled = false;
		vscode.commands.registerCommand('fiberforge.setup', async () => {
			setupCommandCalled = true;
		});

		let promise = vscode.commands.executeCommand('fiberforge.setup');

		promise.then(_ => {
			assert.strictEqual(setupCommandCalled, true, 'Setup command was not called');
			assert.strictEqual(messageFromShowErrorMessage, undefined, 'Error message displayed unexpectedly');
		});
	});

	test('Setup Command Failure - Missing Name', async () => {
		activateExtension();
		// Mock user input
		const mockDbName = 'mysql';

		// Stub vscode.window.showInputBox to provide mock values
		vscode.window.showInputBox = (options?: vscode.InputBoxOptions) => {
			if (options?.prompt === 'Enter database name:') {
				return Promise.resolve(mockDbName);
			} else {
				return Promise.reject(new Error('Unexpected prompt'));
			}
		};

		let promise = vscode.commands.executeCommand('fiberforge.setup');
		promise.then(_ => {
			assert.strictEqual(messageFromShowErrorMessage, 'Name is required.', 'Error message not displayed as expected');
		});
	});

	test('Generate Command Success', async () => {
		activateExtension();

		// Mock user input
		const mockPath = path.join(__dirname, '..', 'assets', 'payload.json');

		// Stub vscode.window.showOpenDialog to provide mock values
		vscode.window.showOpenDialog = () => {
			return Promise.resolve([vscode.Uri.file(mockPath)]);
		};

		let generateCommandCalled = false;
		vscode.commands.registerCommand('fiberforge.generate', async () => {
			generateCommandCalled = true;
		});

		let promise = vscode.commands.executeCommand('fiberforge.generate');
		promise.then(_ => {
			assert.strictEqual(generateCommandCalled, true, 'Generate command was not called');
			assert.strictEqual(messageFromShowErrorMessage, undefined, 'Error message displayed unexpectedly');
		});

	});

	test('Generate Command Failure - No File Selected', async () => {
		activateExtension();

		// Stub vscode.window.showOpenDialog to return undefined (no files selected)
		vscode.window.showOpenDialog = () => {
			return Promise.resolve(undefined);
		};


		let promise = vscode.commands.executeCommand('fiberforge.generate');
		promise.then(_ => {
			assert.strictEqual(messageFromShowErrorMessage, 'No config file selected.', 'Error message not displayed as expected');
		});
	});
});


import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
    const userProvider = new GitHubUserProvider();
    
    vscode.window.registerTreeDataProvider('ghUserTreeView', userProvider);

    // 1. 帳號切換指令
    let switchCmd = vscode.commands.registerCommand('github-user-switcher.switchUser', async (node: GitHubUserItem) => {
        try {
            await execAsync(`gh auth switch -u ${node.username}`);
            vscode.window.showInformationMessage(`Switched to GitHub user: ${node.username}`);
            userProvider.refresh();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to switch user: ${error.message}`);
        }
    });

    // 2. 刷新指令
    let refreshCmd = vscode.commands.registerCommand('github-user-switcher.refresh', () => {
        userProvider.refresh();
    });

    // 3. Welcome View 裡面的登入連結指令
    let loginCmd = vscode.commands.registerCommand('github-user-switcher.login', () => {
        triggerGitHubLogin();
    });

    // 🌟 新增：4. 側邊欄右上角的「新增帳號 (+)」指令
    let addAccountCmd = vscode.commands.registerCommand('github-user-switcher.addAccount', () => {
        triggerGitHubLogin();
    });

    context.subscriptions.push(switchCmd, refreshCmd, loginCmd, addAccountCmd);
}

// 🌟 新增：抽離出來的通用登入邏輯，確保點擊 Welcome View 或右上角 + 號都能完美執行
function triggerGitHubLogin() {
    // 尋找是否已有叫作 'GitHub Auth' 的終端機
    let terminal = vscode.window.terminals.find(t => t.name === 'GitHub Auth');
    
    if (!terminal) {
        terminal = vscode.window.createTerminal('GitHub Auth');
    }
    
    terminal.show();
    terminal.sendText('gh auth login');
}


// Tree Data Provider for the Sidebar
class GitHubUserProvider implements vscode.TreeDataProvider<GitHubUserItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<GitHubUserItem | undefined | null | void> = new vscode.EventEmitter<GitHubUserItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<GitHubUserItem | undefined | null | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: GitHubUserItem): vscode.TreeItem {
		return element;
	}

	// async getChildren(): Promise<GitHubUserItem[]> {
	// 	try {
	// 		// Run 'gh auth status' to get users
	// 		// Note: 'gh auth status' outputs to stderr for some versions, so we catch or read both
	// 		const { stdout, stderr } = await execAsync('gh auth status');
	// 		const output = stdout + stderr;

	// 		return this.parseUsers(output);
	// 	} catch (error) {
	// 		vscode.window.showErrorMessage('Make sure GitHub CLI (gh) is installed and logged in.');
	// 		return [];
	// 	}
	// }

	async getChildren(): Promise<GitHubUserItem[]> {
        try {
            const { stdout, stderr } = await execAsync('gh auth status');
            const output = stdout + stderr;
            
            const users = this.parseUsers(output);
            
            // 如果解析出來沒有任何使用者，回傳空陣列以觸發 Welcome View
            return users;
        } catch (error) {
            // 🌟 優化：當 gh 指令出錯（例如未安裝或完全未登入）時，回傳空陣列顯示歡迎畫面
            return [];
        }
    }

	private parseUsers(output: string): GitHubUserItem[] {
		const users: GitHubUserItem[] = [];
		const lines = output.split('\n');

		let currentUsername: string | null = null;

		for (const line of lines) {
			const trimmed = line.trim();

			// 1. 匹配帳號行，提取用戶名 (例如：✓ Logged in to github.com account chunmiu (keyring))
			const accountMatch = trimmed.match(/account\s+([a-zA-Z0-9-_]+)/);
			if (accountMatch) {
				currentUsername = accountMatch[1];
				continue;
			}

			// 2. 匹配是否為 Active 帳號 (例如：- Active account: true)
			const activeMatch = trimmed.match(/- Active account:\s*(true|false)/);
			if (activeMatch && currentUsername) {
				const isActive = activeMatch[1] === 'true';

				// 找到完整的用戶與狀態，加入陣列
				users.push(new GitHubUserItem(currentUsername, isActive));

				// 重設暫存，準備讀取下一個帳號
				currentUsername = null;
			}
		}

		return users;
	}

}

// Tree Item class representing a row in your sidebar
class GitHubUserItem extends vscode.TreeItem {
	constructor(
		public readonly username: string,
		public readonly isActive: boolean
	) {
		super(username, vscode.TreeItemCollapsibleState.None);

		this.tooltip = `${username} ${isActive ? '(Active)' : ''}`;
		this.description = isActive ? 'Active' : '';

		// Set visual icon indicator
		this.iconPath = isActive
			? new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'))
			: new vscode.ThemeIcon('account');

		// Assign command to trigger when clicked
		this.command = {
			command: 'github-user-switcher.switchUser',
			title: 'Switch User',
			arguments: [this]
		};
	}
}

export function deactivate() { }

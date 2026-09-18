# GitHub User Switcher for VS Code

**GitHub User Switcher** is a sleek VS Code extension designed for developers who juggle multiple GitHub accounts. Deeply integrated with the GitHub CLI (`gh`), it brings your account management straight into the VS Code sidebar. No more typing tedious commands in the terminal—switch your active GitHub profile with just a single click!

---

## ✨ Features

* 👥 **Account List & Active Status**: Automatically fetches and lists all your authorized GitHub accounts in the sidebar. Active profiles are clearly marked with a green checkmark (`✓`) icon.
* ⚡ **One-Click Switch**: Simply click on any account in the sidebar to run `gh auth switch -u <username>` seamlessly in the background. The UI updates instantly.
* ➕ **Quick Add Account**: Click the `+` button in the sidebar title bar to automatically open an integrated terminal running `gh auth login` to easily bind a new profile.
* 🔄 **Manual Refresh**: Click the `🔄` button to instantly sync and update the sidebar whenever you add or alter accounts via external terminals.
* 🛡️ **Friendly Welcome View**: If no accounts are configured or the GitHub CLI is missing, a clean welcome screen guides you through your very first login.

---

## 🛠️ Prerequisites & Configuration

This extension relies directly on the official GitHub CLI tool. Before using it, please ensure you have completed the following setups:

1. **GitHub CLI (`gh`)**:
   * If not installed, download and install it from the [Official GitHub CLI Website](https://github.com).
   * Make sure the `gh` command is accessible from your system environment path.

2. **Sync Git Config to Automatically Follow `gh`** (Highly Recommended):
   To prevent your hardcoded global Git username from conflicting with the active profile switched by this extension, you can strip static global user settings and bind them safely to your individual local repositories instead:
   
   Run the following commands in your terminal:
   ```bash
   # Remove hardcoded static global identities
   git config --global --unset user.name
   git config --global --unset user.email
   
   # Tell Git to seamlessly look up auth tokens and sessions directly via GitHub CLI
   gh auth setup-git
   ```

3. **Initialize Your Local Repository Identity**:
   Because Git requires a baseline author identity to compile commits locally, you must specify local repository tags (this isolates your account from global overrides):
   ```bash
   # Configure identity exclusively for your active project directory
   git config --local user.name "your-github-username"
   git config --local user.email "your-github-email@example.com"
   ```

4. **Initial Login**:
   * Ensure you have at least one account logged in (you can achieve this using the extension's `+` button or by running `gh auth login` in your native terminal).

---

## 📦 Local Installation

1. Download or compile the extension to get the `.vsix` package file.
2. Open VS Code and navigate to the **Extensions** panel on the left sidebar.
3. Click the **`...` (More Actions)** button at the top right of the Extensions panel.
4. Select **Install from VSIX...** and choose the compiled file. Done!

---

## 🤝 Credits

* **Built with Gemini**: This entire extension—from scaffolding and UI components to regex parsers and troubleshooting—was co-developed and optimized with the assistance of **Gemini**, making the development process smooth and efficient!

---

## 📄 License

This project is licensed under the **[MIT License](LICENSE)**. It is completely free for everyone to use, modify, distribute, and implement in commercial workflows.

---

**Developed with ❤️ for developers.**

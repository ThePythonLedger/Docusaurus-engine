# 🐍 The Python Ledger Engine

The technical core of **The Python Ledger**, an interactive, browser-based learning platform. This project combines the static site power of **Docusaurus** with the client-side Python execution of **Skulpt**.

## 🚀 The Tech Stack

- **Framework:** [Docusaurus v3](https://docusaurus.io/) (React-based SSG)
- **Engine:** [Skulpt](http://www.skulpt.org/) (In-browser Python 3 execution)
- **Editor:** [@uiw/react-codemirror](https://uiwjs.github.io/react-codemirror/) (Python syntax highlighting)
- **Deployment:** CI/CD via GitHub Actions

## ⚙️ How the Engine Works

Unlike standard documentation, this project uses a custom React component, `InteractivePython`, to turn static code blocks into live environments.

### The Suspension Logic
To support interactive `input()` calls without freezing the browser's UI thread or hitting `TimeLimitErrors`, the engine uses a **Promise-based Suspension** architecture:
1. When Python hits `input()`, Skulpt triggers a custom `inputfun`.
2. The engine returns a `Promise` and captures the `resolve` function in a React `useRef`.
3. Skulpt "suspends" execution while the promise is pending.
4. Once the user submits the HTML form, the promise resolves, and the Python state resumes exactly where it left off.

### Configuration
The engine is tuned with `execLimit: Infinity` for interactive lessons, ensuring students have unlimited time to process logic and provide inputs without the watchdog timer killing the script.

This is causing a tab crash on infinite loops, and will be fixed in upcoming fixes. Being tracked on `issues` tab.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/razorblade23/the-python-ledger.git
   git clone https://github.com/razorblade23/the-python-ledger-engine.git
   cd the-python-ledger-engine
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   The site will be available at `http://localhost:3000`.

## 📂 Project Structure

- `/src/components/InteractivePython/`: The React logic for the Skulpt engine and terminal UI.

## 🤝 Contributing

We are looking for contributors to help with both **Engine Polish** and **Lesson Content**.

- **Engine:** Improving the terminal UI, adding support for external libraries, or optimizing Skulpt's output handling.
- **Content:** Drafting new lessons in Markdown and improving existing lessons.

See `CONTRIBUTING.md` for our full guidelines and the Discord community for real-time discussion.

## 📄 License
This project is licensed under the [MIT License](LICENSE).

## Community
You can join our community on [Discord](https://discord.gg/d3AG5AbX7H)

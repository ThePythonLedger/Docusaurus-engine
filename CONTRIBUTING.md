# Contributing to The Python Ledger 🐍

First off, thank you for considering contributing! Projects like this live and breathe through community involvement. Whether you are fixing a typo in a lesson or optimizing the Skulpt engine logic, your help is welcome.

---

## 🛠️ Choose Your Path

### 1. Content Contributor (Education)
Help us build the curriculum! We need writers who can explain complex Python concepts in a beginner-friendly way.
* **Target:** [The Python Ledger](https://github.com/ThePythonLedger/Curriculum).
* **Format:** Markdown files using our custom `<InteractivePython>` component for rendering engine to provide runnable python instance (You do not need to know React, its rendered automaticly for you if using `interactive` tag on a code block.
* **Goal:** Create hands-on projects (like the Text Adventure) that reinforce the ledger theme or expand and fix lessons.

### 2. Engine Contributor (Development)
Help us polish the interactive experience. 
* **Target:** `*`.
* **Tech:** React, CodeMirror.
* **Focus:** Improving UI, adding features.

---

## 🚀 How to Get Started

1. **Find an Issue:** Check the [GitHub Issues](https://github.com/ThePythonLedger/Docusaurus-engine/issues) for tags like `good first issue` or `help wanted`.
2. **Fork & Clone:** Fork the repo and clone it locally.
3. **Clone Curriculum**: You will need Curriculum to successfily build the engine
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Create a Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Run Locally:** Use `npm start` to see your changes in real-time.

> [!warning]
> For working with `engine` you will also need to clone the curriculum repository so they are side by side.
>
> Do not mix the repositories, they should be completly independant from each other.

---

## 📝 Contribution Guidelines

### Branching Strategy
* **main**: The stable production branch. Do not commit directly here.
* **feature/**: For new engine features.
* **fix/**: For bug fixes.

### Lesson Standards
If you are writing a new lesson:
* Start with a clear learning objective.
* Use the `<InteractivePython>` component at least once per page for hands-on practice.
* Ensure the code examples are compatible with Python 3 (Skulpt's current implementation).
* Check out curriculum repository for more information or join us on Discord

### Code Style
* We use **Prettier** for formatting. Please run `npm run format` before submitting a PR.
* React components should follow functional patterns and use hooks.

---

## 🤝 Pull Request Process

1. Ensure your code builds locally without errors.
2. Update the `README.md` or documentation if you’ve added a new feature.
3. Submit your PR with a clear description of what changed and why.
4. Link the PR to the relevant Issue (e.g., `Closes #123`).
5. Wait for a maintainer to review your code. We try to respond within 48 hours!

---

## ⚖️ Community Standards
By contributing, you agree to follow our [Code of Conduct](link-to-discord-rules-or-coc-file). Be kind, be helpful, and let’s build the best Python learning tool on the web!

**Questions?** Join our [Discord Community](https://discord.gg/d3AG5AbX7H)!

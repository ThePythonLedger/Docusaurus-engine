# Contributing to The Python Ledger 🐍

First off, thank you for considering contributing! Projects like this live and breathe through community involvement. Whether you are fixing a typo in a lesson or optimizing the Skulpt engine logic, your help is welcome.

---

## 🛠️ Choose Your Path

### 1. Content Contributor (Education)
Help us build the curriculum! We need writers who can explain complex Python concepts in a beginner-friendly way.
* **Target:** [The Python Ledger](https://github.com/razorblade23/the-python-ledger).
* **Format:** Markdown files using our custom `<InteractivePython>` component (You do not need to know React, its rendered automaticly for you if using `interactive` tag on a code block.
* **Goal:** Create hands-on projects (like the Text Adventure) that reinforce the ledger theme or expand and fix lessons.

### 2. Engine Contributor (Development)
Help us polish the interactive experience. 
* **Target:** `/src/components/InteractivePython/`.
* **Tech:** React, Skulpt.js, CodeMirror.
* **Focus:** Improving terminal UI, handling edge cases in Python execution, or adding support for Python standard libraries.

---

## 🚀 How to Get Started

1. **Find an Issue:** Check the [GitHub Issues](link-to-your-issues) for tags like `good first issue` or `help wanted`.
2. **Fork & Clone:** Fork the repo and clone it locally.
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Create a Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Run Locally:** Use `npm start` to see your changes in real-time.

---

## 📝 Contribution Guidelines

### Branching Strategy
* **main**: The stable production branch. Do not commit directly here.
* **feature/**: For new lessons or engine features.
* **fix/**: For bug fixes.

### Lesson Standards
If you are writing a new lesson:
* Start with a clear learning objective.
* Use the `<InteractivePython>` component at least once per page for hands-on practice.
* Ensure the code examples are compatible with Python 3 (Skulpt's current implementation).

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

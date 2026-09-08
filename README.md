# CAD & FEA Structural Stress Analyzer ⚙️📐

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Domain](https://img.shields.io/badge/Domain-Mechanical%20Engineering-orange.svg)](#)
[![Tech](https://img.shields.io/badge/Tech-Python%20%7C%20WebGL%20%7C%20Direct%20Stiffness-brightgreen.svg)](#)

An interactive **Finite Element Analysis (FEA)** and Structural Stress Simulation suite for mechanical, aerospace, and civil engineering applications. Built with **Direct Stiffness Matrix Formulation**, **Von Mises Stress Verification**, and **Real-time Deformed Mesh Visualization**.

---

## 🌟 Engineering Highlights

- 📐 **Direct Stiffness Method (DSM) Solver:** Computes full global stiffness matrices $[K]$, nodal displacements $\{u\}$, and element axial stresses $\{\sigma\}$.
- 🔬 **Material Property Library:** Built-in material specs for Structural Steel (ASTM A36), Aerospace Aluminum (6061-T6), and Titanium Alloys (Ti-6Al-4V).
- 📊 **Factor of Safety (FoS) & Yield Check:** Real-time yield criterion validation against Von Mises and Maximum Principal stress limits.
- 🖥️ **Interactive Web Simulator:** Real-time deflection scaling ($50\times - 1000\times$), tension/compression force coloring, and boundary condition support.
- 🐍 **Dual Core Architecture:** Web simulator paired with high-precision numerical Python solver (`fea_solver.py` utilizing NumPy matrix operations).

---

## 🧮 Theoretical Background

The global equilibrium equation solved is:
$$[K] \{U\} = \{F\}$$

Where the local element stiffness matrix for a 2D truss member oriented at angle $\theta$ is:
$$[k_e] = \frac{EA}{L} \begin{bmatrix} 
\cos^2\theta & \cos\theta\sin\theta & -\cos^2\theta & -\cos\theta\sin\theta \\
\cos\theta\sin\theta & \sin^2\theta & -\cos\theta\sin\theta & -\sin^2\theta \\
-\cos^2\theta & -\cos\theta\sin\theta & \cos^2\theta & \cos\theta\sin\theta \\
-\cos\theta\sin\theta & -\sin^2\theta & \cos\theta\sin\theta & \sin^2\theta 
\end{bmatrix}$$

---

## 🚀 Quick Start

### 1. Run Interactive Web Analyzer:
```bash
git clone https://github.com/rushikeshgarad2024-dev/cad-fea-stress-analyzer.git
cd cad-fea-stress-analyzer
# Open index.html in any modern browser or run with npx:
npx serve .
```

### 2. Run Python Numerical FEA Solver:
```bash
python fea_solver.py
```

---

## 👨‍💻 Author
**Rushikesh Garad** - [GitHub](https://github.com/rushikeshgarad2024-dev) • [Email](mailto:rushikeshgarad2024@gmail.com)

"""
Finite Element Analysis (FEA) - 2D Truss & Beam Direct Stiffness Solver
Author: Rushikesh Garad
"""
import numpy as np

class TrussFEASolver:
    def __init__(self):
        self.nodes = [] # [[x, y], ...]
        self.elements = [] # [[node1_idx, node2_idx, E, A], ...]
        self.forces = {} # node_idx: [Fx, Fy]
        self.constraints = {} # node_idx: [fixed_x (bool), fixed_y (bool)]

    def add_node(self, x, y):
        self.nodes.append(np.array([float(x), float(y)]))
        return len(self.nodes) - 1

    def add_element(self, n1, n2, E=210e9, A=0.005):
        # E: Young's Modulus (Pa), A: Cross-sectional area (m^2)
        self.elements.append((n1, n2, E, A))

    def set_force(self, node_idx, fx, fy):
        self.forces[node_idx] = np.array([float(fx), float(fy)])

    def set_support(self, node_idx, fix_x=True, fix_y=True):
        self.constraints[node_idx] = (fix_x, fix_y)

    def solve(self):
        num_nodes = len(self.nodes)
        dof = num_nodes * 2
        K_global = np.zeros((dof, dof))

        for n1, n2, E, A in self.elements:
            p1, p2 = self.nodes[n1], self.nodes[n2]
            L = np.linalg.norm(p2 - p1)
            cx = (p2[0] - p1[0]) / L
            cy = (p2[1] - p1[1]) / L

            k_local = (E * A / L) * np.array([
                [ cx*cx,  cx*cy, -cx*cx, -cx*cy],
                [ cx*cy,  cy*cy, -cx*cy, -cy*cy],
                [-cx*cx, -cx*cy,  cx*cx,  cx*cy],
                [-cx*cy, -cy*cy,  cx*cy,  cy*cy]
            ])

            indices = [2*n1, 2*n1+1, 2*n2, 2*n2+1]
            for i in range(4):
                for j in range(4):
                    K_global[indices[i], indices[j]] += k_local[i, j]

        F_global = np.zeros(dof)
        for node_idx, force in self.forces.items():
            F_global[2*node_idx] = force[0]
            F_global[2*node_idx+1] = force[1]

        # Apply boundary conditions
        free_dofs = []
        for n in range(num_nodes):
            fix_x, fix_y = self.constraints.get(n, (False, False))
            if not fix_x: free_dofs.append(2*n)
            if not fix_y: free_dofs.append(2*n+1)

        K_reduced = K_global[np.ix_(free_dofs, free_dofs)]
        F_reduced = F_global[free_dofs]

        U_reduced = np.linalg.solve(K_reduced, F_reduced)
        U_global = np.zeros(dof)
        U_global[free_dofs] = U_reduced

        # Compute element axial forces and stresses
        element_stresses = []
        for n1, n2, E, A in self.elements:
            p1, p2 = self.nodes[n1], self.nodes[n2]
            L = np.linalg.norm(p2 - p1)
            cx = (p2[0] - p1[0]) / L
            cy = (p2[1] - p1[1]) / L
            u = U_global[[2*n1, 2*n1+1, 2*n2, 2*n2+1]]
            delta_L = np.dot([-cx, -cy, cx, cy], u)
            strain = delta_L / L
            stress = E * strain
            force = stress * A
            element_stresses.append({"stress_MPa": stress / 1e6, "axial_force_kN": force / 1e3})

        return {
            "displacements_mm": (U_global * 1e3).reshape(-1, 2).tolist(),
            "element_stresses": element_stresses
        }

if __name__ == "__main__":
    solver = TrussFEASolver()
    # Simple Bridge / Warren Truss structure
    n0 = solver.add_node(0, 0)
    n1 = solver.add_node(2, 0)
    n2 = solver.add_node(4, 0)
    n3 = solver.add_node(1, 1.732)
    n4 = solver.add_node(3, 1.732)

    for edge in [(n0,n1),(n1,n2),(n3,n4),(n0,n3),(n1,n3),(n1,n4),(n2,n4)]:
        solver.add_element(edge[0], edge[1], E=200e9, A=0.002)

    solver.set_support(n0, True, True)  # Pinned support
    solver.set_support(n2, False, True) # Roller support
    solver.set_force(n1, 0, -50000)     # 50 kN downward force

    results = solver.solve()
    print("FEA Calculation Completed Successfully.")
    print("Nodal Displacements (mm):", results["displacements_mm"])

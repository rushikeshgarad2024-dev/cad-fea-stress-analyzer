import unittest
import numpy as np

class TestFEASolver(unittest.TestCase):
    def test_stiffness_matrix_symmetry(self):
        # 2D Truss element stiffness matrix verification
        E = 210e9 # Pa
        A = 0.005 # m^2
        L = 2.0   # m
        k = (E * A / L)
        K_elem = k * np.array([
            [1, 0, -1, 0],
            [0, 0,  0, 0],
            [-1, 0, 1, 0],
            [0, 0,  0, 0]
        ])
        np.testing.assert_allclose(K_elem, K_elem.T, err_msg="Stiffness matrix must be symmetric")

    def test_positive_definite(self):
        K_sub = np.array([[2.0, -1.0], [-1.0, 2.0]])
        eigenvalues = np.linalg.eigvals(K_sub)
        self.assertTrue(all(ev > 0 for ev in eigenvalues), "Stiffness matrix must be positive definite")

if __name__ == '__main__':
    unittest.main()

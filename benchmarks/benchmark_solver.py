import time
import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as spla

def benchmark_mesh_solver(num_nodes=5000):
    print(f"Benchmarking FEA solver for {num_nodes} nodes (DOF: {num_nodes*3})...")
    start = time.perf_counter()
    A = sp.diags([1, -0.5, -0.5], [0, -1, 1], shape=(num_nodes*3, num_nodes*3), format='csc')
    b = np.ones(num_nodes*3)
    x = spla.spsolve(A, b)
    elapsed = time.perf_counter() - start
    print(f"Direct sparse solve completed in {elapsed:.4f}s with norm={np.linalg.norm(x):.4f}")

if __name__ == '__main__':
    benchmark_mesh_solver()

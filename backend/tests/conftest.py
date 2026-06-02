import os
import sys

# Make backend modules importable when running `pytest` from the backend dir.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

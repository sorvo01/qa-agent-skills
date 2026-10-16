"""Same permission check in pytest + requests.

    BASE_URL=... ADMIN_TOKEN=... VIEWER_TOKEN=... pytest -q test_permissions.py
"""
import os
import time

import pytest
import requests

BASE_URL = os.environ["BASE_URL"]


def client(token: str) -> requests.Session:
    s = requests.Session()
    s.headers["Authorization"] = f"Bearer {token}"
    return s


@pytest.fixture(scope="module")
def admin():
    return client(os.environ["ADMIN_TOKEN"])


@pytest.fixture(scope="module")
def viewer():
    return client(os.environ["VIEWER_TOKEN"])


@pytest.fixture
def project(admin):
    r = admin.post(f"{BASE_URL}/api/projects", json={"name": f"qa-{time.time_ns()}"}, timeout=10)
    assert r.status_code == 201, r.text
    pid = r.json()["id"]
    yield pid
    admin.delete(f"{BASE_URL}/api/projects/{pid}", timeout=10)


def test_viewer_cannot_delete_project(admin, viewer, project):
    r = viewer.delete(f"{BASE_URL}/api/projects/{project}", timeout=10)
    assert r.status_code == 403
    assert admin.get(f"{BASE_URL}/api/projects/{project}", timeout=10).status_code == 200

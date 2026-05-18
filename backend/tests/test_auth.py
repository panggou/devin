def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"


def test_register_duplicate_user(client, test_user):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "other@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_success(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "testpass123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["username"] == "testuser"


def test_login_wrong_password(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_get_me(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"

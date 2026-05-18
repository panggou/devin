def test_create_server(client, auth_headers):
    response = client.post(
        "/api/servers",
        json={
            "hostname": "web-server-01",
            "ip_address": "10.0.1.10",
            "operating_system": "Ubuntu 22.04",
            "cpu_cores": 4,
            "ram_gb": 16,
            "environment": "production",
            "status": "active",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["hostname"] == "web-server-01"
    assert data["ip_address"] == "10.0.1.10"


def test_list_servers(client, auth_headers):
    client.post(
        "/api/servers",
        json={"hostname": "srv-1", "ip_address": "10.0.0.1"},
        headers=auth_headers,
    )
    client.post(
        "/api/servers",
        json={"hostname": "srv-2", "ip_address": "10.0.0.2"},
        headers=auth_headers,
    )
    response = client.get("/api/servers", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_server(client, auth_headers):
    create_resp = client.post(
        "/api/servers",
        json={"hostname": "srv-get", "ip_address": "10.0.0.5"},
        headers=auth_headers,
    )
    server_id = create_resp.json()["id"]
    response = client.get(f"/api/servers/{server_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["hostname"] == "srv-get"


def test_update_server(client, auth_headers):
    create_resp = client.post(
        "/api/servers",
        json={"hostname": "srv-update", "ip_address": "10.0.0.6"},
        headers=auth_headers,
    )
    server_id = create_resp.json()["id"]
    response = client.put(
        f"/api/servers/{server_id}",
        json={"status": "inactive", "notes": "Decommissioned"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "inactive"


def test_delete_server(client, auth_headers):
    create_resp = client.post(
        "/api/servers",
        json={"hostname": "srv-delete", "ip_address": "10.0.0.7"},
        headers=auth_headers,
    )
    server_id = create_resp.json()["id"]
    response = client.delete(f"/api/servers/{server_id}", headers=auth_headers)
    assert response.status_code == 204

    get_resp = client.get(f"/api/servers/{server_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_server_not_found(client, auth_headers):
    response = client.get("/api/servers/9999", headers=auth_headers)
    assert response.status_code == 404

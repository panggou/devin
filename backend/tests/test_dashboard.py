def test_dashboard_stats(client, auth_headers):
    response = client.get("/api/dashboard", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_servers" in data
    assert "active_servers" in data
    assert "total_users" in data
    assert "environments" in data
    assert "recent_audit_logs" in data

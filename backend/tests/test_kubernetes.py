def test_list_clusters(client, auth_headers):
    response = client.get("/api/kubernetes/clusters", headers=auth_headers)
    assert response.status_code == 200
    clusters = response.json()
    assert len(clusters) == 4
    assert clusters[0]["name"] == "prod-us-east-1"


def test_get_cluster(client, auth_headers):
    response = client.get("/api/kubernetes/clusters/prod-us-east-1", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_cluster_not_found(client, auth_headers):
    response = client.get("/api/kubernetes/clusters/nonexistent", headers=auth_headers)
    assert response.status_code == 404

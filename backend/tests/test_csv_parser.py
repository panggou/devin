from app.utils.csv_parser import parse_csv_content


def test_parse_valid_csv():
    csv_content = (
        "hostname,ip_address,operating_system,environment\n"
        "web-01,10.0.0.1,Ubuntu,production\n"
        "web-02,10.0.0.2,CentOS,staging"
    )
    records, errors = parse_csv_content(csv_content)
    assert len(records) == 2
    assert len(errors) == 0
    assert records[0]["hostname"] == "web-01"


def test_parse_csv_missing_required_column():
    csv_content = "hostname,operating_system\nweb-01,Ubuntu"
    records, errors = parse_csv_content(csv_content)
    assert len(records) == 0
    assert len(errors) > 0
    assert "Missing required columns" in errors[0]


def test_parse_csv_empty_hostname():
    csv_content = "hostname,ip_address\n,10.0.0.1"
    records, errors = parse_csv_content(csv_content)
    assert len(records) == 0
    assert any("hostname is required" in e for e in errors)

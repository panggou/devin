import csv
import io
import logging

logger = logging.getLogger(__name__)

REQUIRED_FIELDS = {"hostname", "ip_address"}
VALID_FIELDS = {
    "hostname",
    "ip_address",
    "operating_system",
    "cpu_cores",
    "ram_gb",
    "environment",
    "status",
    "location",
    "owner",
    "notes",
}


def parse_csv_content(content: str) -> tuple[list[dict], list[str]]:
    records = []
    errors = []

    try:
        reader = csv.DictReader(io.StringIO(content))

        if reader.fieldnames is None:
            errors.append("CSV file is empty or has no headers")
            return records, errors

        headers = set(reader.fieldnames)
        missing = REQUIRED_FIELDS - headers
        if missing:
            errors.append(f"Missing required columns: {', '.join(missing)}")
            return records, errors

        for i, row in enumerate(reader, start=2):
            row_errors = []
            if not row.get("hostname", "").strip():
                row_errors.append(f"Row {i}: hostname is required")
            if not row.get("ip_address", "").strip():
                row_errors.append(f"Row {i}: ip_address is required")

            if row_errors:
                errors.extend(row_errors)
                continue

            record = {}
            for field in VALID_FIELDS:
                value = row.get(field, "").strip() if row.get(field) else None
                if field == "cpu_cores" and value:
                    try:
                        record[field] = int(value)
                    except ValueError:
                        errors.append(f"Row {i}: cpu_cores must be a number")
                        continue
                elif field == "ram_gb" and value:
                    try:
                        record[field] = int(value)
                    except ValueError:
                        errors.append(f"Row {i}: ram_gb must be a number")
                        continue
                else:
                    record[field] = value

            if "hostname" in record and "ip_address" in record:
                records.append(record)

    except csv.Error as e:
        logger.error("CSV parsing error: %s", str(e))
        errors.append(f"CSV parsing error: {str(e)}")

    return records, errors

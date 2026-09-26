"""Unit tests for airport codes and metro sector dictionary."""
from app.utils.airport_codes import is_valid_iata_code, get_city_for_code

def test_is_valid_iata_code():
    assert is_valid_iata_code("DEL") is True
    assert is_valid_iata_code("bom") is True
    assert is_valid_iata_code("XYZ") is False

def test_get_city_for_code():
    assert get_city_for_code("DEL") == "Delhi"
    assert get_city_for_code("BLR") == "Bengaluru"
    assert get_city_for_code("XYZ") == "XYZ"

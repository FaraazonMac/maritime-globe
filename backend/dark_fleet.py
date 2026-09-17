from datetime import datetime, timezone

# How long a ship can go without a new position update before we treat it
# as worth flagging. Ships in this busy region normally report every few
# minutes — a longer gap is a real signal, though it can also just mean
# the ship sailed outside our tracked box, not necessarily wrongdoing.
DARK_THRESHOLD_MINUTES = 20

def flag_dark_ships(ships: list[dict]) -> list[dict]:
    now = datetime.now(timezone.utc)
    for ship in ships:
        last_seen = ship.get("last_seen")
        if not last_seen:
            continue

        minutes_since = (now - last_seen).total_seconds() / 60
        ship["minutes_since_update"] = round(minutes_since, 1)

        if minutes_since >= DARK_THRESHOLD_MINUTES:
            ship["is_dark_flagged"] = True
            ship["dark_flag_reason"] = (
                f"No AIS update for {minutes_since:.0f} min "
                f"(may have left tracked area or gone dark)"
            )
        else:
            ship["is_dark_flagged"] = False
            ship["dark_flag_reason"] = None
    return ships
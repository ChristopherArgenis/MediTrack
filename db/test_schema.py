"""Prueba rápida del esquema de MediTrack con datos de ejemplo.

Uso: python3 db/test_schema.py
"""
import sqlite3
from pathlib import Path

SCHEMA = Path(__file__).with_name("schema.sql").read_text(encoding="utf-8")


def main() -> None:
    db = sqlite3.connect(":memory:")
    db.execute("PRAGMA foreign_keys = ON")
    db.executescript(SCHEMA)

    db.execute("INSERT INTO Medication(name, dose, instructions) VALUES ('Metformina','850 mg','Con alimentos')")
    db.execute("INSERT INTO Schedule(medication_id, scheduled_time) VALUES (1,'08:00'), (1,'20:00')")
    db.execute("INSERT INTO Device(model, platform, has_watch_app, imu_access, paired_at)"
               " VALUES ('Galaxy Watch FE','wearos',1,1,'2026-11-01T10:00:00Z'), ('Fitbit Sense 2','fitbitos',0,0,'2026-11-01T10:00:00Z')")
    db.execute("INSERT INTO Caregiver(name, relationship, consent_at) VALUES ('Laura','hija','2026-11-01T10:00:00Z')")

    rows = [
        ("2026-11-19T14:00:00Z", "2026-11-19T14:06:00Z", "confirmed", "sensor", 0.93),
        ("2026-11-20T02:00:00Z", "2026-11-20T02:55:00Z", "delayed", "manual", None),
        ("2026-11-20T14:00:00Z", None, "unconfirmed", None, None),
    ]
    for sched, conf, status, src, p in rows:
        db.execute(
            "INSERT INTO IntakeRecord(medication_id, scheduled_datetime, confirmed_datetime, status, confirmation_source, fused_confidence, device_id)"
            " VALUES (1,?,?,?,?,?,1)", (sched, conf, status, src, p))
    db.execute("INSERT INTO Notification(intake_record_id, recipient_type, recipient_id, kind, sent_at, channel, status)"
               " VALUES (3,'caregiver',1,'escalation','2026-11-20T14:30:00Z','push','delivered')")
    db.executemany("INSERT INTO Evidence(intake_record_id, kind, value, weight, observed_at, model_version) VALUES (?,?,?,?,?,?)", [
        (1, 'imu_gesture', 0.92, 2.2, '2026-11-19T14:05:40Z', 'imu-0.1'),
        (1, 'imu_sequence', 0.85, 1.2, '2026-11-19T14:05:40Z', 'imu-0.1'),
        (1, 'time_routine', 0.75, 0.5, '2026-11-19T14:05:40Z', None),
    ])
    db.execute("INSERT INTO FusionDecision(intake_record_id, decided_at, probability, threshold, decision)"
               " VALUES (1,'2026-11-19T14:06:00Z',0.93,0.85,'confirmed')")
    # La probabilidad guardada coincide con la fusión logística de las evidencias
    import math
    x = -0.35 + sum(w * (2 * v - 1) for v, w in db.execute("SELECT value, weight FROM Evidence WHERE intake_record_id = 1"))
    stored = db.execute("SELECT probability FROM FusionDecision WHERE intake_record_id = 1").fetchone()[0]
    assert abs(1 / (1 + math.exp(-x)) - stored) < 0.005, (x, stored)

    # Restricciones: una toma confirmada sin fuente debe fallar
    try:
        db.execute("INSERT INTO IntakeRecord(medication_id, scheduled_datetime, confirmed_datetime, status)"
                   " VALUES (1,'2026-11-21T14:00:00Z','2026-11-21T14:01:00Z','confirmed')")
        raise SystemExit("ERROR: se aceptó una toma confirmada sin confirmation_source")
    except sqlite3.IntegrityError:
        pass
    # Estado inválido debe fallar
    try:
        db.execute("INSERT INTO IntakeRecord(medication_id, scheduled_datetime, status) VALUES (1,'2026-11-22T14:00:00Z','tomada')")
        raise SystemExit("ERROR: se aceptó un status inválido")
    except sqlite3.IntegrityError:
        pass

    print("day         scheduled on_time delayed unconfirmed pct")
    for r in db.execute("SELECT * FROM v_adherence_daily ORDER BY day"):
        print("  ".join(str(x) for x in r))
    print("OK: esquema y restricciones verificados")


if __name__ == "__main__":
    main()

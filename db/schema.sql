-- MediTrack · esquema SQLite local (app móvil)
-- Base: tablas del documento original + correcciones (fuente de confirmación,
-- eventos de gesto, consentimiento del cuidador y resumen diario del wearable).
-- Regla: todas las fechas/horas se guardan en UTC (ISO-8601); la UI convierte a la zona local.

PRAGMA foreign_keys = ON;

CREATE TABLE Medication (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT    NOT NULL,
  dose             TEXT,                          -- p. ej. '500 mg'
  instructions     TEXT,                          -- p. ej. 'con alimentos'
  frequency_hours  INTEGER CHECK (frequency_hours IS NULL OR frequency_hours > 0),
  is_active        INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  created_at       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE Schedule (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  medication_id    INTEGER NOT NULL REFERENCES Medication(id) ON DELETE CASCADE,
  scheduled_time   TEXT    NOT NULL CHECK (scheduled_time GLOB '[0-2][0-9]:[0-5][0-9]'), -- hora local 'HH:MM'
  days_of_week     TEXT    NOT NULL DEFAULT '1,2,3,4,5,6,7'                               -- 1 = lunes
);

CREATE TABLE IntakeRecord (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  medication_id        INTEGER NOT NULL REFERENCES Medication(id),
  schedule_id          INTEGER REFERENCES Schedule(id),
  scheduled_datetime   TEXT    NOT NULL,                -- UTC
  confirmed_datetime   TEXT,                            -- UTC, NULL si no hay confirmación
  status               TEXT    NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','confirmed','delayed','unconfirmed')),
  confirmation_source  TEXT    CHECK (confirmation_source IN ('gesture','manual','caregiver')),
  gesture_confidence   REAL    CHECK (gesture_confidence IS NULL OR gesture_confidence BETWEEN 0 AND 1),
  tolerance_minutes    INTEGER NOT NULL DEFAULT 30,
  -- coherencia: una toma confirmada siempre tiene hora y fuente
  CHECK ((status IN ('confirmed','delayed')) = (confirmed_datetime IS NOT NULL AND confirmation_source IS NOT NULL)),
  UNIQUE (medication_id, scheduled_datetime)
);
CREATE INDEX idx_intake_sched ON IntakeRecord(scheduled_datetime);
CREATE INDEX idx_intake_status ON IntakeRecord(status);

-- Cada clasificación del modelo de gesto, aceptada o no (sirve para auditar falsos positivos)
CREATE TABLE GestureEvent (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  intake_record_id   INTEGER REFERENCES IntakeRecord(id),   -- NULL si ocurrió fuera de una ventana de toma
  detected_at        TEXT    NOT NULL,
  confidence         REAL    NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  model_version      TEXT    NOT NULL,
  decision           TEXT    NOT NULL CHECK (decision IN ('accepted','asked_user','rejected','ignored'))
);

CREATE TABLE Caregiver (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  name                  TEXT NOT NULL,
  relationship          TEXT,                        -- 'hija', 'enfermero', ...
  email                 TEXT UNIQUE,
  phone                 TEXT,
  consent_at            TEXT NOT NULL,               -- cuándo el usuario autorizó compartir avisos
  is_active             INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1))
);

CREATE TABLE Notification (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  intake_record_id  INTEGER NOT NULL REFERENCES IntakeRecord(id),
  recipient_type    TEXT    NOT NULL CHECK (recipient_type IN ('user','caregiver')),
  recipient_id      INTEGER,                         -- Caregiver.id cuando recipient_type = 'caregiver'
  kind              TEXT    NOT NULL DEFAULT 'reminder'
                    CHECK (kind IN ('reminder','second_reminder','snooze','escalation','update')),
  sent_at           TEXT    NOT NULL,
  channel           TEXT    NOT NULL CHECK (channel IN ('push','fitbit_notification','sms','email')),
  status            TEXT    NOT NULL CHECK (status IN ('sent','delivered','failed'))
);

-- Resumen diario obtenido de la Fitbit Web API (no son señales crudas del sensor)
CREATE TABLE WearableDaily (
  date               TEXT PRIMARY KEY,               -- 'YYYY-MM-DD' local
  resting_hr         INTEGER,
  steps              INTEGER,
  sleep_minutes      INTEGER,
  skin_temp_delta    REAL,
  synced_at          TEXT NOT NULL
);

-- Vista de adherencia diaria (confirmadas = confirmed + delayed)
CREATE VIEW v_adherence_daily AS
SELECT substr(scheduled_datetime, 1, 10)                                   AS day,
       COUNT(*)                                                            AS scheduled,
       SUM(status = 'confirmed')                                           AS on_time,
       SUM(status = 'delayed')                                             AS delayed,
       SUM(status = 'unconfirmed')                                         AS unconfirmed,
       ROUND(100.0 * SUM(status IN ('confirmed','delayed')) / COUNT(*), 1) AS pct_confirmed
FROM IntakeRecord
WHERE status <> 'pending'
GROUP BY day;

-- MediTrack · esquema SQLite local (app móvil)
-- Base: tablas del documento original + correcciones (fuente de confirmación,
-- reloj usado, evidencias múltiples, consentimiento del cuidador y resumen diario del wearable).
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

-- Reloj vinculado: define qué evidencias se pueden capturar
CREATE TABLE Device (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  model            TEXT    NOT NULL,                 -- 'Galaxy Watch FE', 'Fitbit Sense 2', ...
  platform         TEXT    NOT NULL CHECK (platform IN ('wearos','watchos','zeppos','fitbitos','garmin')),
  has_watch_app    INTEGER NOT NULL CHECK (has_watch_app IN (0,1)),  -- ¿corre una app propia en el reloj?
  imu_access       INTEGER NOT NULL CHECK (imu_access IN (0,1)),     -- ¿la app puede leer acelerómetro/giroscopio?
  paired_at        TEXT    NOT NULL,
  is_active        INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1))
);

CREATE TABLE IntakeRecord (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  medication_id        INTEGER NOT NULL REFERENCES Medication(id),
  schedule_id          INTEGER REFERENCES Schedule(id),
  device_id            INTEGER REFERENCES Device(id),        -- reloj activo en la toma (NULL = solo teléfono)
  scheduled_datetime   TEXT    NOT NULL,                -- UTC
  confirmed_datetime   TEXT,                            -- UTC, NULL si no hay confirmación
  status               TEXT    NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','confirmed','delayed','unconfirmed')),
  confirmation_source  TEXT    CHECK (confirmation_source IN ('sensor','manual','caregiver')), -- 'sensor' = fusión automática
  fused_confidence     REAL    CHECK (fused_confidence IS NULL OR fused_confidence BETWEEN 0 AND 1),
  tolerance_minutes    INTEGER NOT NULL DEFAULT 30,
  -- coherencia: una toma confirmada siempre tiene hora y fuente
  CHECK ((status IN ('confirmed','delayed')) = (confirmed_datetime IS NOT NULL AND confirmation_source IS NOT NULL)),
  UNIQUE (medication_id, scheduled_datetime)
);
CREATE INDEX idx_intake_sched ON IntakeRecord(scheduled_datetime);
CREATE INDEX idx_intake_status ON IntakeRecord(status);

-- Cada evidencia observada (aceptada o no): permite auditar falsos positivos y reentrenar
CREATE TABLE Evidence (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  intake_record_id   INTEGER REFERENCES IntakeRecord(id),   -- NULL si ocurrió fuera de una ventana de toma
  kind               TEXT    NOT NULL CHECK (kind IN ('imu_gesture','imu_sequence','nfc_tap','time_routine','off_body')),
  value              REAL    NOT NULL CHECK (value BETWEEN 0 AND 1),  -- probabilidad o 1/0 para eventos
  weight             REAL    NOT NULL,                      -- peso usado en la fusión (log-odds)
  observed_at        TEXT    NOT NULL,
  model_version      TEXT                                   -- versión del modelo que produjo el valor
);
CREATE INDEX idx_evidence_intake ON Evidence(intake_record_id);

-- Cada decisión de la fusión de evidencias
CREATE TABLE FusionDecision (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  intake_record_id   INTEGER NOT NULL REFERENCES IntakeRecord(id),
  decided_at         TEXT    NOT NULL,
  probability        REAL    NOT NULL CHECK (probability BETWEEN 0 AND 1),
  threshold          REAL    NOT NULL,
  decision           TEXT    NOT NULL CHECK (decision IN ('confirmed','asked_user','waiting'))
);

CREATE TABLE Caregiver (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  name                  TEXT NOT NULL,
  relationship          TEXT,                        -- 'hija', 'enfermero', ...
  email                 TEXT UNIQUE,
  phone                 TEXT,
  consent_at            TEXT NOT NULL,               -- cuándo el usuario autorizó compartir avisos
  notify_on_confirm     INTEGER NOT NULL DEFAULT 0 CHECK (notify_on_confirm IN (0,1)), -- también recibe confirmaciones
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

-- DROP TABLE IF EXISTS users CASCADE;
-- CREATE TABLE users (
--     id SERIAL PRIMARY KEY,
--     username VARCHAR(50) NOT NULL UNIQUE,
--     password VARCHAR(255) NOT NULL,
--     email VARCHAR(100) NOT NULL UNIQUE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- DROP TABLE IF EXISTS problem CASCADE;
-- CREATE TABLE problem (
--     id SERIAL PRIMARY KEY,
--     title VARCHAR(255) NOT NULL,
--     difficulty VARCHAR(50) NOT NULL,
--     categories TEXT[] NOT NULL,
--     description TEXT NOT NULL,
--     replayerurl VARCHAR(255),
--     options JSONB,
--     solution TEXT,
--     explanation TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- DROP TABLE IF EXISTS problemState CASCADE;
-- CREATE TABLE problemState (
--     id SERIAL PRIMARY KEY,
--     problem_id INTEGER NOT NULL REFERENCES problem(id) ON DELETE CASCADE,
--     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     state VARCHAR(255),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

INSERT INTO problem (title, difficulty, categories, description, replayerurl, options, solution, explanation)
VALUES
(
    '[MTT MS 5€ - Milieu MTT] Pot open CO vs LJ 25 BB deep',
    'Easy',
    ARRAY['Pot Open'],
    'Joueur assez passif',
    'https://www.winamax.fr/replayer/replayer.html?2025-d6bf1ebb864f1f480c9f6b33fbd1887e977ca04a0032d278cd771c6fb67b1285&lang=fr_FR',
    '{"option1": "Check", "option2": "All-In"}',
    'Check',
    'Easy GU en + tu bas encore quelques mains river (FD/BD)'
),
(
    '[MTT MS 5€ - Début de tournoi] Pot 3bet BTN vs LJ 35 BB deep',
    'Easy',
    ARRAY['Pot 3bet'],
    'Je 3bet pf AQo. Flop TT3 avec 2 trèfle, en pot 3bet je bet range 1/4 en position',
    'https://www.winamax.fr/replayer/replayer.html?2025-29fe9e5f87d0e66b88f487eb835ea878ac4d80dc60f993d03489613179c7f9d7&lang=fr_FR',
    '{"option1": "Check", "option2": "Bet 1/4 pot"}',
    'Check',
    'Au vu des positions, je préfère flat pre flop.'
),
(
    '[MTT MS 5€ - Début de tournoi] Pot open CO vs BB 35 BB deep',
    'Easy',
    ARRAY['Pot Open'],
    'Pas d''infos sur vilain. Flop il donk 1BB ici, je décide de call avec 66. Je ne me vois pas fold ni raise',
    'https://www.winamax.fr/replayer/replayer.html?2025-29fe9e5f87d0e66b88f487eb835ea878ac4d80dc60f993d03489613179c7f9d7&lang=fr_FR',
    '{"option1": "Call", "option2": "Fold"}',
    'Fold',
    'River Easy fold'
);

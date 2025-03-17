const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Pool} = require('pg');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 5000;
const bootstrapData = null;
require('dotenv').config();

app.use(cors());

app.use(express.json());

const pool = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE
});
module.exports = pool;


pool.connect((err) => {
    if (err) {
        console.error('Błąd połączenia z bazą danych', err);
    } else {
        console.log('Połączono z bazą danych');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.send(result.rows[0]);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .send('Error connecting to database');
    }
});

const secret = 'your_jwt_secret';

app.post('/update-elements-type', async (req,res) => {
    try {
        const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
        const bootstrapData = await response.json();
        const elements = bootstrapData.element_types;
        for (const element of elements) {
            const {id,plural_name, plural_name_short, singular_name, singular_name_short,squad_select, squad_min_select, squad_max_select, 
                squad_min_play, squad_max_play, ui_shirt_specific, sub_positions_locked, element_count} = element;
                try {
                    const result = await pool.query (
                        `INSERT INTO element_types (
                        id,
                        plural_name,
                        plural_name_short,
                        singular_name,
                        singular_name_short,
                        squad_select,
                        squad_min_select,
                        squad_max_select,
                        squad_min_play,
                        squad_max_play,
                        ui_shirt_specific,
                        sub_positions_locked,
                        element_count
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
                    ) ON CONFLICT (id) DO UPDATE SET
                        plural_name = EXCLUDED.plural_name,
                        plural_name_short = EXCLUDED.plural_name_short,
                        singular_name = EXCLUDED.singular_name,
                        singular_name_short = EXCLUDED.singular_name_short,
                        squad_select = EXCLUDED.squad_select,
                        squad_min_select = EXCLUDED.squad_min_select,
                        squad_max_select = EXCLUDED.squad_max_select,
                        squad_min_play = EXCLUDED.squad_min_play,
                        squad_max_play = EXCLUDED.squad_max_play,
                        ui_shirt_specific = EXCLUDED.ui_shirt_specific,
                        sub_positions_locked = EXCLUDED.sub_positions_locked,
                        element_count = EXCLUDED.element_count`,
                        [
                            id,
                            plural_name,
                            plural_name_short,
                            singular_name,
                            singular_name_short,
                            squad_select,
                            squad_min_select,
                            squad_max_select,
                            squad_min_play,
                            squad_max_play,
                            ui_shirt_specific,
                            sub_positions_locked,
                            element_count
                        ]
                    );
                } catch (err) {
                    console.error('Error updating element type:', err);
                }
                }
                res.status(200).send('Element types updated successfully');
        }
        catch (error) {
            console.error('Error fetching element types:', error);
            res.status(500).json({ message: 'Error fetching element types' });
    }
});

app.post('/register', async (req, res) => {
    const {username, password} = req.body;
    try {
        console.log('Received registration request for username:', username);
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);

        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );
        console.log('User created:', result.rows[0]);

        res
            .status(201)
            .json(result.rows[0]);
    } catch (err) {
        console.error('Error during registration:', err);
        res
            .status(500)
            .send('User already exists or other error');
    }
});

app.post('/update-teams-info', async (req, res) => {
    console.log("Updating teams informations");
    try {
        const responsePlayers = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
        const bootstrapData = await responsePlayers.json();
        const teams = bootstrapData.teams; // zakładam, że bootstrapData.teams jest już zdefiniowane
        for (const team of teams) {
            const { id, code, name, short_name, strength_overall_home, strength_overall_away,
                strength_attack_home, strength_attack_away,
                strength_defence_home, strength_defence_away } = team;
               
            try {
                const result = await pool.query(
                    `UPDATE teams
                     SET id_fpl = $2,
                         team = $3,
                         short_name = $4,
                         strength_overall_home = $5,
                         strength_overall_away = $6,
                         strength_attack_home = $7,
                         strength_attack_away = $8,
                         strength_defence_home = $9,
                         strength_defence_away = $10
                     WHERE id = $1`,
                    [id, code, name, short_name, strength_overall_home, strength_overall_away, strength_attack_home, strength_attack_away, strength_defence_home, strength_defence_away]
                );
                if (result.rowCount === 0) {
                    console.log(`Team with ID ${id} not found`);
                    res.status(404).json({ message: `Team with ID ${id} not found` });
                    return; // Zatrzymaj dalsze przetwarzanie
                }           
            } catch (error) {
                console.error(`Error updating team with ID ${id}:`, error);
            }
        }

        res.status(200).json({ message: 'Teams updated successfully' });
    } catch (error) {
        console.error('Error updating teams:', error);
        res.status(500).json({ message: 'Error updating teams' });
    }
});

app.post('/update-players-info', async (req, res) => {
    console.log("Updating players informations");
    try {
        const responsePlayers = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
        const bootstrapData = await responsePlayers.json();
        const playersStats = bootstrapData.elements;
    
        for (const player of playersStats) {
            const {
                id, first_name, second_name, team_code, total_points,
                chance_of_playing_next_round, chance_of_playing_this_round,
                element_type, ep_next, ep_this, event_points, form,
                now_cost, points_per_game, removed, selected_by_percent,
                status, transfers_in, transfers_in_event, transfers_out,
                transfers_out_event, value_form, value_season, web_name,
                minutes, goals_scored, assists, clean_sheets, goals_conceded,
                own_goals, penalties_saved, penalties_missed, yellow_cards,
                red_cards, saves, bonus, bps, influence, creativity, threat,
                ict_index, starts, expected_goals, expected_assists,
                expected_goal_involvements, expected_goals_conceded,
                influence_rank, influence_rank_type, creativity_rank,
                creativity_rank_type, threat_rank, threat_rank_type,
                ict_index_rank, ict_index_rank_type,
                corners_and_indirect_freekicks_order, corners_and_indirect_freekicks_text,
                direct_freekicks_order, direct_freekicks_text,
                penalties_order, penalties_text, expected_goals_per_90,
                saves_per_90, expected_assists_per_90, expected_goal_involvements_per_90,
                expected_goals_conceded_per_90, goals_conceded_per_90,
                now_cost_rank, now_cost_rank_type, form_rank, form_rank_type,
                points_per_game_rank, points_per_game_rank_type,
                selected_rank, selected_rank_type, starts_per_90, clean_sheets_per_90
            } = player;
    
            try {
                const result = await pool.query(
                    `INSERT INTO players (
                        id, first_name, second_name, team_code, total_points, 
                        chance_of_playing_next_round, chance_of_playing_this_round,
                        element_type, ep_next, ep_this, event_points, form, now_cost, 
                        points_per_game, removed, selected_by_percent, status, transfers_in, 
                        transfers_in_event, transfers_out, transfers_out_event, value_form, 
                        value_season, web_name, minutes, goals_scored, assists, clean_sheets, 
                        goals_conceded, own_goals, penalties_saved, penalties_missed, 
                        yellow_cards, red_cards, saves, bonus, bps, influence, creativity, 
                        threat, ict_index, starts, expected_goals, expected_assists, 
                        expected_goal_involvements, expected_goals_conceded, influence_rank, 
                        influence_rank_type, creativity_rank, creativity_rank_type, threat_rank, 
                        threat_rank_type, ict_index_rank, ict_index_rank_type, 
                        corners_and_indirect_freekicks_order, corners_and_indirect_freekicks_text, 
                        direct_freekicks_order, direct_freekicks_text, penalties_order, 
                        penalties_text, expected_goals_per_90, saves_per_90, 
                        expected_assists_per_90, expected_goal_involvements_per_90, 
                        expected_goals_conceded_per_90, goals_conceded_per_90, now_cost_rank, 
                        now_cost_rank_type, form_rank, form_rank_type, points_per_game_rank, 
                        points_per_game_rank_type, selected_rank, selected_rank_type, 
                        starts_per_90, clean_sheets_per_90
                    )
                    VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, 
                        $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47,
                        $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62,
                        $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76
                    )
                    ON CONFLICT (id)
                    DO UPDATE SET
                        first_name = $2, second_name = $3, team_code = $4, total_points = $5, 
                        chance_of_playing_next_round = $6, chance_of_playing_this_round = $7,
                        element_type = $8, ep_next = $9, ep_this = $10, event_points = $11, 
                        form = $12, now_cost = $13, points_per_game = $14, removed = $15, 
                        selected_by_percent = $16, status = $17, transfers_in = $18, 
                        transfers_in_event = $19, transfers_out = $20, transfers_out_event = $21,
                        value_form = $22, value_season = $23, web_name = $24, minutes = $25, 
                        goals_scored = $26, assists = $27, clean_sheets = $28, goals_conceded = $29, 
                        own_goals = $30, penalties_saved = $31, penalties_missed = $32, 
                        yellow_cards = $33, red_cards = $34, saves = $35, bonus = $36, bps = $37, 
                        influence = $38, creativity = $39, threat = $40, ict_index = $41, starts = $42, 
                        expected_goals = $43, expected_assists = $44, expected_goal_involvements = $45,
                        expected_goals_conceded = $46, influence_rank = $47, influence_rank_type = $48,
                        creativity_rank = $49, creativity_rank_type = $50, threat_rank = $51, 
                        threat_rank_type = $52, ict_index_rank = $53, ict_index_rank_type = $54, 
                        corners_and_indirect_freekicks_order = $55, corners_and_indirect_freekicks_text = $56, 
                        direct_freekicks_order = $57, direct_freekicks_text = $58, penalties_order = $59, 
                        penalties_text = $60, expected_goals_per_90 = $61, saves_per_90 = $62, 
                        expected_assists_per_90 = $63, expected_goal_involvements_per_90 = $64, 
                        expected_goals_conceded_per_90 = $65, goals_conceded_per_90 = $66, now_cost_rank = $67,
                        now_cost_rank_type = $68, form_rank = $69, form_rank_type = $70, 
                        points_per_game_rank = $71, points_per_game_rank_type = $72, 
                        selected_rank = $73, selected_rank_type = $74, starts_per_90 = $75, clean_sheets_per_90 = $76
                    `,
                    [
                        id, first_name, second_name, team_code, total_points,
                        chance_of_playing_next_round, chance_of_playing_this_round,
                        element_type, ep_next, ep_this, event_points, form, now_cost,
                        points_per_game, removed, selected_by_percent, status, transfers_in,
                        transfers_in_event, transfers_out, transfers_out_event, value_form,
                        value_season, web_name, minutes, goals_scored, assists, clean_sheets,
                        goals_conceded, own_goals, penalties_saved, penalties_missed,
                        yellow_cards, red_cards, saves, bonus, bps, influence, creativity,
                        threat, ict_index, starts, expected_goals, expected_assists,
                        expected_goal_involvements, expected_goals_conceded, influence_rank,
                        influence_rank_type, creativity_rank, creativity_rank_type, threat_rank,
                        threat_rank_type, ict_index_rank, ict_index_rank_type,
                        corners_and_indirect_freekicks_order, corners_and_indirect_freekicks_text,
                        direct_freekicks_order, direct_freekicks_text, penalties_order,
                        penalties_text, expected_goals_per_90, saves_per_90,
                        expected_assists_per_90, expected_goal_involvements_per_90,
                        expected_goals_conceded_per_90, goals_conceded_per_90, now_cost_rank,
                        now_cost_rank_type, form_rank, form_rank_type, points_per_game_rank,
                        points_per_game_rank_type, selected_rank, selected_rank_type,
                        starts_per_90, clean_sheets_per_90
                    ]
                );            
            } catch (error) {
                console.error(`Error upserting player with ID ${id}:`, error);
                res.status(500).json({ message: "Error while updating or inserting player" });
            }
        }

        res.status(200).json({ message: 'Teams updated successfully' });
    } catch (error) {
        console.error('Error updating teams:', error);
        res.status(500).json({ message: 'Error updating teams' });
    }
});

app.post('/register', async (req, res) => {
    const {username, password} = req.body;
    try {
        console.log('Received registration request for username:', username);
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);

        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );
        console.log('User created:', result.rows[0]);

        res
            .status(201)
            .json(result.rows[0]);
    } catch (err) {
        console.error('Error during registration:', err);
        res
            .status(500)
            .send('User already exists or other error');
    }
});

app.post('/update-teams-info', async (req, res) => {
    console.log("Updating teams informations");
    try {
        const responsePlayers = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
        const bootstrapData = await responsePlayers.json();
        const teams = bootstrapData.teams; // zakładam, że bootstrapData.teams jest już zdefiniowane
        for (const team of teams) {
            const { id, code, name, short_name, strength_overall_home, strength_overall_away,
                strength_attack_home, strength_attack_away,
                strength_defence_home, strength_defence_away } = team;
               
            try {
                const result = await pool.query(
                    `UPDATE teams
                     SET id_fpl = $2,
                         team = $3,
                         short_name = $4,
                         strength_overall_home = $5,
                         strength_overall_away = $6,
                         strength_attack_home = $7,
                         strength_attack_away = $8,
                         strength_defence_home = $9,
                         strength_defence_away = $10
                     WHERE id = $1`,
                    [id, code, name, short_name, strength_overall_home, strength_overall_away, strength_attack_home, strength_attack_away, strength_defence_home, strength_defence_away]
                );
                if (result.rowCount === 0) {
                    console.log(`Team with ID ${id} not found`);
                    res.status(404).json({ message: `Team with ID ${id} not found` });
                    return; // Zatrzymaj dalsze przetwarzanie
                }           
            } catch (error) {
                console.error(`Error updating team with ID ${id}:`, error);
            }
        }

        res.status(200).json({ message: 'Teams updated successfully' });
    } catch (error) {
        console.error('Error updating teams:', error);
        res.status(500).json({ message: 'Error updating teams' });
    }
});

app.get('/get-players-stats', async (req,res) => {
    try {
        const result = await pool.query(`SELECT * FROM player_basic_view ORDER BY "total points"`);
        const data = result.rows.map(row => ({
            ...row, 
            form:parseFloat(parseFloat(row.form).toFixed(1)),
            "Selected by %":parseFloat(parseFloat(row["Selected by %"]).toFixed(1))
        }));
        res.json(data);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/get-headers', async (req,res) => {
    try {
        const result = await pool.query('SELECT * FROM players_ext');
        res.json(result.rows);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
})

app.post('/get-opponent-short-name', async (req, res) => {
    const {teamId} = req.body;
    try {
        const result = await pool.query('SELECT short_name FROM teams WHERE id = $1', [teamId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Team not found' });  
        }
        res.status(200).json({ short_name: result.rows[0].short_name });
        
    } catch (error) {
        console.error('Error fetching team short name:', error);
        res.status(500).json({ message: 'Error fetching team short name' });
    }
});


app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        if (result.rows.length === 0) {
            console.log('User not found');
            return res
                .status(400)
                .send('User not found');
        }
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid password');
            return res
                .status(400)
                .send('Invalid password');
        }
        const token = jwt.sign({
            id: user.id
        }, secret, {expiresIn: '1h'});
        console.log('Token generated:', token);
        res.json({token, teamid: user.teamid});

    } catch (err) {
        console.error('Error logging in:', err);
        res
            .status(500)
            .send('Error logging in');
    }
});

app.post('/insert-teamid', async (req, res) => {
    const {username, teamId} = req.body;

    try {
        const response = await fetch(
            `https://fantasy.premierleague.com/api/entry/${teamId}/`);
        try {
            const result = await pool.query(
                'UPDATE users SET teamid = $1 WHERE username = $2 RETURNING *',
                [teamId, username]
            );
            if (result.rowCount === 0) {
                return res
                    .status(404)
                    .json({message: 'User not found'});
            }
            res
                .status(200)
                .json({message: 'Team ID updated successfully', user: result.rows[0]});
        } catch (error) {
            console.error('Error updating Team ID:', error);
            res
                .status(500)
                .json({message: 'Error updating Team ID'});
        }
    } catch (error) {
        setErrorMessage('Error saving Team ID');
    }
});

app.post('/get-user-team', async (req, res) => {
    const { teamId } = req.body;
    try {
        // Pobranie informacji o bieżącym wydarzeniu (current event)
        const responseCurrentEvent = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/`);
        const fplDataCurrentEvent = await responseCurrentEvent.json();
        const currentEvent = fplDataCurrentEvent.current_event;

        // Pobranie składu drużyny na bieżący event
        const responseCurrentTeam = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/event/${currentEvent}/picks/`);
        const fplData = await responseCurrentTeam.json();

        // Pobranie danych wszystkich zawodników z API FPL (bootstrap-static)
        const responsePlayers = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
        const bootstrapData = await responsePlayers.json();

        // Mapowanie zawodników w drużynie (picks) i przypisanie dodatkowych danych
        const detailedPicks = fplData.picks.map(pick => {
            const playerDetails = bootstrapData.elements.find(player => player.id === pick.element);

            if (!playerDetails) {
                console.error(`Brak danych dla zawodnika o ID ${pick.element}`);
                return pick; // Zwracamy oryginalny pick, jeśli nie znajdziemy szczegółów zawodnika
            }

            // Zwracamy nowy obiekt, który łączy dane pick i playerDetails
            return {
                ...pick, // dane picka
                playerDetails: { // dane zawodnika z bootstrap-static
                    first_name: playerDetails.first_name,
                    second_name: playerDetails.second_name,
                    web_name: playerDetails.web_name,
                    now_cost: playerDetails.now_cost,
                    element_type: playerDetails.element_type,
                    team: playerDetails.team,
                    team_code: playerDetails.team_code,
                    total_points: playerDetails.total_points,
                    next_fixture: playerDetails.team_code,
                    id: playerDetails.id,
                    /*total_points: playerDetails.total_points,
                    form: playerDetails.form,
                    news: playerDetails.news,
                    minutes: playerDetails.minutes,
                    goals_scored: playerDetails.goals_scored,
                    assists: playerDetails.assists,
                    clean_sheets: playerDetails.clean_sheets,
                    goals_conceded: playerDetails.goals_conceded,
                    yellow_cards: playerDetails.yellow_cards,
                    red_cards: playerDetails.red_cards,
                    saves: playerDetails.saves,
                    influence: playerDetails.influence,
                    creativity: playerDetails.creativity,
                    threat: playerDetails.threat,
                    ict_index: playerDetails.ict_index,*/
                    // Dodaj więcej danych, jeśli potrzebne
                }
            };
        });

        // Zwracamy zmodyfikowane dane zespołu z dodatkowymi informacjami o zawodnikach
        res.status(200).json({
            message: 'FPL Team Data fetched successfully',
            fplData: detailedPicks
        });
    } catch (error) {
        console.error('Error fetching FPL team data:', error);
        res.status(500).json({ message: 'Error fetching FPL team data' });
    }
});

app.post('/get-player-fixtures', async (req, res) => {
    const { playerId } = req.body;

    try {
        const playerFixturesResponse = await fetch(`https://fantasy.premierleague.com/api/element-summary/${playerId}/`);
        const playerFixturesData = await playerFixturesResponse.json();

        if (playerFixturesData && playerFixturesData.fixtures.length > 0) {
            const nextFixture = playerFixturesData.fixtures[0]; // Zakładamy, że pierwszy mecz to najbliższy mecz
            res.status(200).json({ nextFixture });
        } else {
            res.status(200).json({ nextFixture: null });
        }
    } catch (error) {
        console.log('Error fetching player fixtures: ', error);
        res.status(500).json({ message: 'Error fetching player fixtures' });
    }
});



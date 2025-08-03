const express = require('express');
const router = express.Router();
const db = require('../db');

const tabFieldMap = {
    'Faculty Info': { table: 'faculty_info', column: 'first_name' },
    'Publication': { table: 'publications', column: 'year' },
    'Expert Talk': { table: 'expert_talks', column: 'firstName' },
    'Event Attended': { table: 'events_attended', column: 'title' },
    'Event Organized': { table: 'event_organized', column: 'title' },

    'Extra Curricular': { table: 'extra_curricular', column: 'participants.Array.map.firstName' },//jsonn
    'Internships': { table: 'internships', column: 'firstName' },
    'Placement': { table: 'placement', column: 'firstName' },
    'Competitive Exam': { table: 'competitive_examinations', column: 'firstName' },
    'Higher Education': { table: 'higher_education', column: 'first_name' },
    'BTP Details': { table: 'btp_details', column: 'student.firstName' }, //json
    'Paper Presentation': { table: 'paper_presentation', column: 'firstName' },

    'Others': { table: 'faculty_contributions', column: 'first_name' },
    'Outreach': { table: 'faculty_contributions', column: 'outreach_event_name' },

    'Research and Development': { table: 'project_patent_mou', column: 'pi_name' },
    'Consultancy': { table: 'project_patent_mou', column: 'faculty_in_charge' },
    'Patent': { table: 'project_patent_mou', column: 'inventors' },
    'MoU': { table: 'project_patent_mou', column: 'organizationName' },
    'Paper Reviews': { table: 'paper_reviews', column: 'first_name' }
};

router.post('/:tab', async (req, res) => {
    const tab = decodeURIComponent(req.params.tab);
    console.log(tab)
    const { value } = req.body;

    const config = tabFieldMap[tab];
    if (!config) return res.status(400).json({ success: false, error: 'Invalid tab' });

    try {
        if (config.table === 'extra_curricular') {
            // Special handling for extra_curricular since it has a nested JSON structure
            let rows;
            if (!value || value.trim() === "") {
                // Show all entries if value is empty
                [rows] = await db.query(`SELECT * FROM extra_curricular`);
            } else {
                [rows] = await db.query(
                    `SELECT * FROM extra_curricular WHERE JSON_CONTAINS(participants,CAST(? AS JSON))`, [`{"firstName": "${value}"}`]
                );
            }
            console.log(`Searching in ${config.table} for participants with firstName "${value}"`);
            console.log(rows);
            if (!rows.length) return res.json({ success: true, entries: [] });
            res.json({ success: true, entries: rows });
            return;
        }
        else if (config.table === 'btp_details') {
            // Special handling for btp_details since it has a nested JSON structure
            let rows;
            if (!value || value.trim() === "") {
                // Show all entries if value is empty
                [rows] = await db.query(`SELECT * FROM btp_details`);
            }
            else {
                [rows] = await db.query(
                    `SELECT * FROM btp_details WHERE JSON_CONTAINS(students, CAST(? AS JSON))`, [`{"firstName": "${value}"}`]
                );
            }
            // console.log(`Searching in ${config.table} for student with firstName "${value}"`);
            // console.log(rows);
            if (!rows.length) return res.json({ success: true, entries: [] });
            res.json({ success: true, entries: rows });
            return;
        }
        else if (config.table === 'faculty_info') {
            // Special handling for faculty_info since it has multiple columns to search
            const [rows] = await db.query(
                `SELECT * FROM faculty_info 
                 WHERE first_name LIKE ?`,
                [`%${value}%`]
            );
            // console.log(`Searching in ${config.table} for first_name, last_name, or email containing "${value}"`);
            // console.log(rows);
            if (!rows.length) return res.json({ success: true, entries: [] });
            res.json({ success: true, entries: rows });
            return;
        }
        else if (config.table === 'project_patent_mou') {
            // Special handling for project_patent_mous since it has multiple columns to search
            let rows;
            if (!value || value.trim() === "") {
                // Show all entries if value is empty
                [rows] = await db.query(`SELECT * FROM project_patent_mou WHERE category=?`,[tab]);
            }
            else {
                const [rows] = await db.query(
                    `SELECT * FROM project_patent_mou 
                 WHERE category=? AND (JSON_CONTAINS(pi_name, CAST(? AS JSON))
                 OR JSON_CONTAINS(faculty_in_charge, CAST(? AS JSON))
                 OR JSON_CONTAINS(inventors, CAST(? AS JSON))
                 OR organizationName LIKE ?)`,
                    [
                        tab,
                        `{"firstName": "${value}"}`,
                        `{"firstName": "${value}"}`,
                        `{"firstName": "${value}"}`,
                        `%${value}%`
                    ]
                );
            }
            // console.log(`Searching in ${config.table} for pi_name, faculty_in_charge, inventors, or organizationName containing "${value}"`);
            console.log(rows);
            if (!rows.length) return res.json({ success: true, entries: [] });
            res.json({ success: true, entries: rows });
            return;
        }
        else {
            const [rows] = await db.query(
                `SELECT * FROM ${config.table} WHERE ${(config.table === 'faculty_contributions' && config.column === 'outreach_event_name') ? `section="outreach" AND ${config.column}` : (config.table === 'faculty_contributions' ? `section!="outreach" AND ${config.column}` : config.column)} LIKE ?`,
                [`%${value}%`]
            );
            // console.log(`Searching in ${config.table} for ${config.column} containing "${value}"`);
            // console.log(rows);  
            if (!rows.length) return res.json({ success: true, entries: [] });
            res.json({ success: true, entries: rows });
            return;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'DB query failed' });
    }
});

module.exports = router;
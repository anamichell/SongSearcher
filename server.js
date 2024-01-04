const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const ejs = require('ejs');

const PORT = 8080;

let db;

(async () => {
    try {
        db = await open({
            filename: 'SongSearcher.sqlite',
            driver: sqlite3.Database
        });
        console.log('Connected to the database');
    } catch (error) {
        console.log('Error connecting to the database');
    }
})();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'static')));

app.get('/songs', async (req, res) => {
    try {
        // Fetch albums
        const albums = await db.all('SELECT * FROM Albums');

        // Fetch songs and lyrics sequentially
        for (const album of albums) {
            // Fetch songs associated with the album
            album.songs = await db.all('SELECT * FROM Songs WHERE album_id = ?', [album.album_id]);

            // Fetch lyrics for each song
            for (const song of album.songs) {
                song.lyrics = await db.all('SELECT * FROM Lyrics WHERE song_id = ?', [song.song_id]);
            }
        }

        // Moved the console.log statement inside the asynchronous block
        console.log('Albums:', albums);

        // Render the 'lyricsearch' template and pass data to it
        res.render('lyricsearch', { albums });
    } catch (error) {
        console.error('Error fetching data from the database:', error);
        res.status(500).send('Internal Server Error');
    }
});





app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
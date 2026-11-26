const db = require('../config/db.js');
const logger = require('../logger');

exports.createNotes = async (req, res)=>{

    try{
        const {title, content} = req.body;

        const userId = req.user.id;

        if(!title){
            return res.status(400).json({Error: "Title is Missing"});
        }
        else if(!content){
            return res.status(400).json({Error: "Content is Missing"});
        }
        else{
            await db.query('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?);', [userId, title, content]);
            logger.info(`User ${userId} created a new note: "${title}"`);
            return res.status(201).json({Message: "Note is Created!", Titlt: title, Content: content}); 
        }

    }
    catch(err){
        logger.error("Error:", err.message);
        return res.status(500).json({Error: "Failed to create Note"});
    }
};

exports.getNotes = async (req, res)=>{
    try{
        const userId = req.user.id;

        const [rows] = await db.query("SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC;", [userId]);

        logger.info(`User ${userId} fetched ${rows.length} notes.`);

        return res.status(200).json(rows)

    }catch(err){
        logger.error("Error: ", err.message);
        return res.status(404).json({Error: "Failed to Fetch the notes."})
    }

};

exports.updateNotes = async (req, res) => {
    try{
        const userId = req.user.id;
        const noteId = req.params.id;

        const {title, content} = req.body;

        const [note_rows] = await db.query('UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?;', [title, content, noteId, userId]);

        if(note_rows.affectedRows === 0){
            return res.status(404).json({Error: `${title} doesn't Exist or you DOn't have permission`});
        }

        logger.info(`User ${userId} updated note ID ${noteId} to title: "${title}"`);
        return res.status(201).json({Message: 'Note Updated Successfully', title, content });

    }catch(err){
        logger.error("Error: ", err.message);
        return res.status(500).json({Error: "Failed to Update the Note!"});
    }

};

exports.deleteNotes = async (req, res)=>{
    try{
        const userId = req.user.id;
        const noteId = req.params.id;

        const [note_row] = await db.query('DELETE FROM notes WHERE id = ? AND user_id = ?;', [noteId, userId]);

        if (note_row.affectedRows === 0){
            return res.status(404).json({Error: "The note doesn't exist"});
        }

        logger.info(`User ${userId} deleted note ID ${noteId}`);

        return res.status(200).json({Message: 'Note Deleted Successfully'});

    }catch(err){
        logger.error("Error: ", err.message);
        return res.status(500).json({Error: 'Failed to delete the note'});
    }
};
export default function Notecard({ note, deleteNote, updateNote }) {
    const handleDownload = () => {
        // 1. Create a temporary HTML element
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = note.content;
        
        // 2. Extract just the plain text (removes <b>, <p>, etc.)
        const plainText = tempDiv.innerText || tempDiv.textContent;

        // 3. Create the file with .txt extension
        const blob = new Blob([plainText], { type: 'text/plain' });
        
        // 4. Trigger the download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${note.title}.txt`; // <--- Changed to .txt
        
        document.body.appendChild(link);
        link.click();
        
        // 5. Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    return (
        <div className="bg-dark/40 border-none rounded-lg overflow-hidden shadow-2xl m-2">
            <h3 className="bg-dark rounded-t-lg p-2 text-white text-center">{note.title}</h3>
            <div className="overflow-hidden">
                <div
                    className="text-dark text-sm leading-relaxed line-clamp-4 break-words p-4"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                />
            </div>
            <div className="flex justify-center justify-between">
                <button className="bg-dark m-2 rounded-lg p-1 text-white hover:bg-accent/50 hover:text-dark" onClick={() => deleteNote(note.id)}>Delete Note</button>
                <button className="bg-dark m-2 rounded-lg p-1 text-white hover:bg-accent/50 hover:text-dark" onClick={() => updateNote(note.id)}>Update Note</button>
                <button
                    onClick={handleDownload}
                    className="bg-dark m-2 rounded-lg p-1 text-white hover:bg-accent/50 hover:text-dark"
                >
                    Download
                </button>
            </div>
        </div>
    );
}
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 1. Check if user is logged in & Fetch Notes
    useEffect(() => {
        getNotes();
    }, []);

    const getNotes = async () => {
        const token = localStorage.getItem("access");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const res = await axios.get("http://127.0.0.1:8000/api/notes/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(res.data);
        } catch (error) {
            alert("Session expired. Please login again.");
            localStorage.clear();
            navigate("/login");
        }
    };

    // 2. Create a Note
    const createNote = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("access");
        setLoading(true);

        try {
            const res = await axios.post(
                "http://127.0.0.1:8000/api/notes/",
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Add new note to the list immediately (Optimistic update)
            setNotes([res.data, ...notes]);
            setTitle("");
            setContent("");
        } catch (error) {
            alert("Failed to create note");
        } finally {
            setLoading(false);
        }
    };

    // 3. Delete a Note
    const deleteNote = async (id) => {
        const token = localStorage.getItem("access");
        if (!confirm("Are you sure you want to delete this note?")) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/api/notes/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove the deleted note from state
            setNotes(notes.filter((note) => note.id !== id));
        } catch (error) {
            alert("Failed to delete note");
        }
    };

    // 4. Logout
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* --- Navbar --- */}
            <nav className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            My<span className="text-blue-600">Diary</span>
                        </h1>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- Main Content --- */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                
                {/* Section 1: Create Note Form */}
                <div className="mb-10 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Write a new memory...</h2>
                    <form onSubmit={createNote}>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full text-black rounded-lg border-gray-200 border p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <textarea
                                placeholder="What's on your mind?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows="3"
                                className="w-full text-black rounded-lg border-gray-200 border p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                            ></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save Note"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section 2: Notes Grid */}
                {notes.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p>No notes yet. Start writing above!</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {notes.map((note) => (
                            <div 
                                key={note.id} 
                                className="group relative flex flex-col justify-between rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                                            {note.title}
                                        </h3>
                                        <span className="text-xs text-gray-400">
                                            {new Date(note.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-4 whitespace-pre-wrap">
                                        {note.content}
                                    </p>
                                </div>
                                
                                <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => deleteNote(note.id)}
                                        className="text-xs font-medium text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Home;
import  { useState, useEffect , useRef } from "react";
import {  useNavigate, Link } from "react-router-dom";
import axios from "axios";
function Home() {
    const recognitionRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);

    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Modal States
    const [selectedNote, setSelectedNote] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    
    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("SpeechRecognition not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onstart = () => {
            console.log("🎤 Speech recognition started");
        };

        recognition.onresult = (event) => {
            console.log("📝 Speech result event:", event);

            let finalText = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalText += event.results[i][0].transcript + " ";
            }
            }

            if (finalText) {
            setContent((prev) => prev + finalText);
            }
        };

        recognition.onerror = (event) => {
            console.error("❌ Speech error:", event.error);
        };

        recognition.onend = () => {
            console.log("⛔ Speech recognition ended");
            setIsRecording(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
        }, []);


        const handleSpeechToggle = () => {
            const recognition = recognitionRef.current;

            if (!recognition) {
                alert("Speech recognition not supported in this browser.");
                return;
            }

            if (isRecording) {
                recognition.stop();
                setIsRecording(false);
                console.log("🛑 Manual stop");
            } else {
                recognition.start();
                setIsRecording(true);
                console.log("▶️ Manual start");
            }
            };



    
        useEffect(() => {
            checkLoginAndFetch();
        }, []);
    const checkLoginAndFetch = async () => {
        const token = localStorage.getItem("access");
        if (token) {
            setIsLoggedIn(true);
            try {
                const res = await axios.get("http://127.0.0.1:8000/api/notes/", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotes(res.data);
            } catch (error) {
                console.log("Not logged in or token expired");
                setIsLoggedIn(false);
            }
        }
    };

    const createNote = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("access");
        if (!token) {
            alert("Please login to save your note!");
            navigate("/login");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(
                "http://127.0.0.1:8000/api/notes/",
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotes([res.data, ...notes]);
            setTitle("");
            setContent("");
        } catch (error) {
            alert("Failed to create note");
        } finally {
            setLoading(false);
        }
    };

    const updateNote = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("access");
        try {
            const res = await axios.put(
                `http://127.0.0.1:8000/api/notes/${selectedNote.id}/`,
                { title: editTitle, content: editContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Update the note in the local list
            const updatedNotes = notes.map(n => n.id === selectedNote.id ? res.data : n);
            setNotes(updatedNotes);
            
            // Update the modal view
            setSelectedNote(res.data);
            setIsEditing(false); // Switch back to view mode
        } catch (error) {
            alert("Failed to update note");
        }
    };

    const deleteNote = async (id) => {
        const token = localStorage.getItem("access");
        if (!confirm("Are you sure?")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/api/notes/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(notes.filter((n) => n.id !== id));
            if (selectedNote && selectedNote.id === id) {
                closeModal();
            }
        } catch (error) {
            alert("Failed to delete");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        setNotes([]);
        closeModal();
    };

    // --- Modal Helpers ---
    const openModal = (note) => {
        setSelectedNote(note);
        setEditTitle(note.title);
        setEditContent(note.content);
        setIsEditing(false);
    };

    const closeModal = () => {
        setSelectedNote(null);
        setIsEditing(false);
    };

    // Filter Logic
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentNotes = notes.filter(note => new Date(note.created_at) > threeDaysAgo);
    const olderNotes = notes.filter(note => new Date(note.created_at) <= threeDaysAgo);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-50">
            {/* --- SIDEBAR (Older Notes) --- */}
            {
                isSidebarOpen && (
                    <aside className="w-64 flex-shrink-0 bg-gray-900 text-white overflow-y-auto">
                        
                        <div className="p-6">
                            
                            <h2 className="text-xl font-bold tracking-wider flex items-center justify-around">Archives
                                <button 
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                                    className="flex items-center justify-end  z-10 p-2 rounded-md  text-gray-400 focus:outline-none " 
                                >
                                    {
                                        isSidebarOpen &&
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        
                                    }
                                </button>

                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Older than 3 days</p>
                        </div>
                        
                        <div className="px-4 space-y-2">
                            {isLoggedIn && olderNotes.length === 0 && <p className="text-sm text-gray-600 px-2">No archived notes.</p>}
                            {!isLoggedIn && <p className="text-sm text-gray-600 px-2">Login to see archives.</p>}
                            
                            {olderNotes.map((note) => (
                                <div 
                                    key={note.id} 
                                    onClick={() => openModal(note)}
                                    className="block rounded-md p-3 hover:bg-gray-800 transition cursor-pointer group"
                                >
                                    <h3 className="font-medium truncate text-gray-200">{note.title}</h3>
                                    <p className="text-xs text-gray-500 truncate">{new Date(note.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </aside>
                )
            }
            
            

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="flex items-center justify-between bg-white px-8 py-4 shadow-sm border-b">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                        className=" top-4 left-4 z-10 p-2 rounded-md  text-gray-700 focus:outline-none " 
                    >
                        {
                            !isSidebarOpen &&
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            
                        }
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">My<span className="text-blue-600">Diary</span></h1>
                    <div>
                        {isLoggedIn ? (
                            <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-700">Logout</button>
                        ) : (
                            <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-800">Login</Link>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Memories</h2>
                        {!isLoggedIn && <div className="rounded-lg bg-blue-50 p-4 border border-blue-100 text-blue-800 mb-6">👋 Welcome! You are viewing as a guest. <Link to="/login" className="underline font-bold">Login</Link> to see your past notes.</div>}
                        
                        {isLoggedIn && recentNotes.length === 0 && <p className="text-gray-400 italic">No notes from the last 3 days.</p>}

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {recentNotes.map((note) => (
                                <div key={note.id} onClick={() => openModal(note)} className="relative cursor-pointer rounded-xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                                    <h3 className="font-bold text-gray-800 mb-1">{note.title}</h3>
                                    <p className="text-xs text-gray-400 mb-3">{new Date(note.created_at).toDateString()}</p>
                                    <p className="text-sm text-gray-600 line-clamp-3">{note.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Write Today's Story</h2>
                        <form onSubmit={createNote} className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                            <input type="text" placeholder="Title of your memory..." value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full mb-4 text-black rounded-lg border-gray-300 border p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" />
                            <div className="relative mb-4">
                                <textarea placeholder="What happened today? (Click mic to dictate)" value={content} onChange={(e) => setContent(e.target.value)} required rows="4" className="w-full text-black rounded-lg border-gray-300 border p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition pr-10"></textarea>
                                <button
                                    type="button"
                                    onClick={handleSpeechToggle}
                                    className={`mic-btn ${isRecording ? "active" : ""}`}
                                    >
                                    🎤
                                    </button>

                            </div>
                            <div className="flex justify-end items-center gap-4">
                                {!isLoggedIn && <span className="text-xs text-orange-500">You will be asked to login on save.</span>}
                                <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">{loading ? "Saving..." : "Save Note"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* --- MODAL (Dialog Box) --- */}
            {selectedNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm" onClick={closeModal}>
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Header Actions */}
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                                {isEditing ? "Editing Mode" : new Date(selectedNote.created_at).toLocaleString()}
                            </span>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* CONTENT AREA */}
                        {isEditing ? (
                            <form onSubmit={updateNote}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input 
                                        type="text" 
                                        value={editTitle} 
                                        onChange={(e) => setEditTitle(e.target.value)} 
                                        className="w-full text-black rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" 
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea 
                                        rows="10" 
                                        value={editContent} 
                                        onChange={(e) => setEditContent(e.target.value)} 
                                        className="w-full text-black  rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" 
                                    ></textarea>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditing(false)} 
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-6 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedNote.title}</h2>
                                <div className="prose max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed mb-8">
                                    {selectedNote.content}
                                </div>
                                
                                <div className="flex justify-end gap-3 border-t pt-4">
                                    <button 
                                        onClick={() => deleteNote(selectedNote.id)} 
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                                    >
                                        Delete Note
                                    </button>
                                    <button 
                                        onClick={() => setIsEditing(true)} 
                                        className="px-6 py-2 rounded-lg bg-gray-900 text-sm font-medium text-white hover:bg-black transition"
                                    >
                                        Edit Note
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
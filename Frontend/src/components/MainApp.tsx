import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import FileTree from "./FileTree";
import type { MouseEvent } from "react";
import { Markdown } from "@tiptap/markdown";
import { FileFormatService } from "../services/FileFormatService";

type MainAppProps = {
    onReset: () => void;
}

type TreeNode = {
    name: string;
    path: string;
    extension: string;
    type: "file" | "folder";
    children?: TreeNode[];
};

const fileTypes = [
    { label: "📄 Text File", ext: ".txt" },
    { label: "📝 Rich Text", ext: ".rtf" },
    { label: "📑 Markdown", ext: ".md" },
    { label: "💙 C++", ext: ".cpp" },
    { label: "🟨 JavaScript", ext: ".js" },
    { label: "⚙️ C", ext: ".c" },
];


export default function MainApp({ onReset }: MainAppProps) {
    const [onContextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        node: TreeNode;
    } | null>(null);

    const [existingtree, setExistingtree] = useState<TreeNode[] | null>(null)
    const [content, setContent] = useState<string | null>(null)
    const [currentFile, setCurrentFile] = useState<string | null>(null)
    const [saved, setSaved] = useState(true)
    const [editingPath, setEditingPath] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [fileselectdialog, setFileselectdialog] = useState(false)
    const [currentExtension, setCurrentExtension] = useState("");
    const [editorVersion, setEditorVersion] = useState(0);


    const editor = useEditor({
        extensions: [StarterKit, Markdown],
        content: "",
        onUpdate: () => setSaved(false),
        editorProps: {
            attributes: {
        class: "prose prose-invert prose-zinc max-w-[720px] mx-auto focus:outline-none min-h-full py-4 text-[16px] leading-[1.75] tracking-[-0.003em] obsidian-editor",
            },
        },
    })

   

    const handleReturnPath = async () => {
        await window.electron.settings.save({ vaultPath: null })
        onReset();
    }

    const handleread = async (node: any) => {
        if (node.type === "folder") return;
        setCurrentFile(node.path)
        const text = await window.electron.notes.read(node.path);

    if (editor) {
        FileFormatService.load(
            editor,
            node.extension,
            text
        );
    }
        setContent(text)
        setCurrentFile(node.path);
        setCurrentExtension(node.extension);
        setSaved(true)
    }

    const handleSave = async () => {
    try {
        if (!currentFile || content === null || !editor) {
            alert("No file selected or no content to save.");
            return;
        }

        await window.electron.notes.save(
            currentFile,
            editor.getText()   // <-- Replace this
        );

        setSaved(true);
    } catch (err) {
        alert(err);
    }
};

    const handleFolderCreation = async(type: string) => {
        await window.electron.notes.create(type)
        test1()
    }

    const deletion = async(type: "file" | "folder", path: string) => {
           await window.electron.notes.delete(type, path)
           test1()
    }

    const handleRename = async () => {
    if (!editingPath) return;

    await window.electron.notes.rename(editingPath, editingName);

    setEditingPath(null);
    setEditingName("");

    await test1();
};

     const test1 = async () => {
            const tree = await window.electron.vault.getTree()
            setExistingtree(tree as TreeNode[])
    }

    useEffect(() => {    
        test1()
    }, [])

    useEffect(() => {
        const listener = async (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                await handleSave();
            }
        };

        window.addEventListener("keydown", listener);

        return () => window.removeEventListener("keydown", listener);
    }, [editor, content, currentFile]);

    useEffect(() => {
    if (!editor) return;

    const update = () => {
        setEditorVersion(v => v + 1);
    };

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);

    return () => {
        editor.off("selectionUpdate", update);
        editor.off("transaction", update);
    };
        }, [editor]);

    const currentFileName = currentFile?.split(/[\\/]/).pop();

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0c] text-zinc-300">
            <div className="flex flex-1 min-h-0">
                <aside className="flex w-64 shrink-0 flex-col border-r border-white/5 bg-[#0d0d10]">
                    <div
                        className="flex items-center justify-between border-b border-white/5 px-4 py-3"
                        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
                    >
                        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Vault
                        </span>
                        <button
                            onClick={handleReturnPath}
                            className="rounded px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
                            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                        >
                            Switch
                        </button>
                    </div>
                    <div>
                        <button onClick={() => handleFolderCreation("folder")}>+ 📁</button>
                        <div className="relative inline-block">
                            <button
                                onClick={() => setFileselectdialog((prev) => !prev)}
                            >
                                + 🗒️
                            </button>

                            {fileselectdialog && (
                                <div className="absolute left-full top-0 ml-2 w-56 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl z-50">
                                    {fileTypes.map((file) => (
                                        <button
                                            key={file.ext}
                                            className="block w-full px-4 py-2 text-left hover:bg-zinc-800"
                                            onClick={() => {
                                                handleFolderCreation(file.ext);
                                                setFileselectdialog(false);
                                            }}
                                        >
                                            {file.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 py-2">
                        {existingtree === null ? (
                            <p className="px-2 py-1 text-xs text-zinc-600">Loading...</p>
                        ) : existingtree.length === 0 ? (
                            <p className="px-2 py-1 text-xs text-zinc-600">No files yet</p>
                        ) : (
                            <FileTree
                                nodes={existingtree}
                                currentFile={currentFile}
                                onFileClick={handleread}
                                onContextMenu={(e: MouseEvent, node) => {
                                    setContextMenu({
                                        x: e.clientX,
                                        y: e.clientY,
                                        node,
                                    });
                                }}
                                editingPath={editingPath}
                                editingName={editingName}
                                setEditingName={setEditingName}
                                onRename={handleRename}
                                onCancelRename={() => setEditingPath(null)}
                            />
                        )}
                    </div>
                </aside>

                <main className="flex flex-1 flex-col min-w-0">
                    <div
                        className="flex items-center justify-between border-b border-white/5 px-6 py-3"
                        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
                    >
                        <span className="text-sm text-zinc-400">
                            {currentFileName ?? "No file open"}
                        </span>
                        <div
    className="flex items-center gap-4"
    style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
>
    {currentFile && (
        <span
            className={`text-xs ${
                saved ? "text-zinc-600" : "text-amber-500"
            }`}
        >
            {saved ? "Saved" : "Unsaved changes"}
        </span>
    )}

    <div className="flex">
        <button
            onClick={() => window.electron.window.minimize()}
            className="w-10 h-8 hover:bg-zinc-800 transition"
        >
            ─
        </button>

        <button
            onClick={() => window.electron.window.maximize()}
            className="w-10 h-8 hover:bg-zinc-800 transition"
        >
            □
        </button>

        <button
            onClick={() => window.electron.window.close()}
            className="w-10 h-8 hover:bg-red-600 transition"
        >
            ✕
        </button>
    </div>
</div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-10 py-8">
                        {currentFile ? (
                            <EditorContent editor={editor} />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-zinc-600">
                                Select a file from the sidebar to start editing
                            </div>
                        )}
                    </div>
                    {currentFile && editor && (
    <div
        className="fixed bottom-6 right-6 z-40 flex items-center gap-1 rounded-xl border border-white/10 bg-[#161618]/95 px-2 py-1.5 shadow-2xl backdrop-blur-sm"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
        <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            
        >
            <b>B</b>
        </ToolbarButton>
        <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
        >
            <i>I</i>
        </ToolbarButton>
        <ToolbarButton
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
        >
            <s>S</s>
        </ToolbarButton>

        <Divider />

        <ToolbarButton
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
            H1
        </ToolbarButton>
        <ToolbarButton
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
            H2
        </ToolbarButton>
        <ToolbarButton
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
            H3
        </ToolbarButton>

        <Divider />

        <ToolbarButton
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
            •
        </ToolbarButton>
        <ToolbarButton
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
            1.
        </ToolbarButton>

        <Divider />

        <ToolbarButton
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
            "
        </ToolbarButton>
        <ToolbarButton
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
            {"</>"}
        </ToolbarButton>
        <ToolbarButton
            active={false}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
            —
        </ToolbarButton>
    </div>
)}
                </main>
            </div>

            {onContextMenu && (
                <div
                    style={{
                        position: "fixed",
                        left: onContextMenu.x,
                        top: onContextMenu.y,
                        background: "#1e1e1e",
                        border: "1px solid #333",
                        borderRadius: 6,
                        padding: 8,
                        zIndex: 9999,
                    }}
                >
                    <div
                        style={{ padding: 6, cursor: "pointer" }}
                        onClick={() => {
                            console.log("Rename", onContextMenu.node);
                            setContextMenu(null);
                            setEditingPath(onContextMenu.node.path);
                            setEditingName(onContextMenu.node.name);
                            setContextMenu(null);
                        }}
                    >
                        Rename
                    </div>

                    <div
                        style={{ padding: 6, cursor: "pointer" }}
                        onClick={() => {
                            console.log("Delete", onContextMenu.node);
                            setContextMenu(null);
                            deletion(onContextMenu.node.type, onContextMenu.node.path)
                        }}
                    >
                        Delete
                    </div>
                </div>
            )}
        </div>
    );
}

function ToolbarButton({
    children,
    active,
    onClick,
}: {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-medium transition-all duration-150 ${
                active
                    ? "bg-blue-500 text-white shadow-sm shadow-blue-500/30"
                    : "text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
            }`}
        >
            {children}
        </button>
    );
}
function Divider() {
    return <div className="mx-0.5 h-4 w-px bg-white/10" />;
}
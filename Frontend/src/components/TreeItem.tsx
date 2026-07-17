import { useState } from "react";
import type { MouseEvent } from "react";

export type TreeNode = {
    name: string;
    path: string;
    extension: string;
    type: "file" | "folder";
    children?: TreeNode[];
};

type Props = {
    node: TreeNode;
    depth?: number;
    onOpenFile: (node: TreeNode) => void;
    onContextMenu: (
        e: MouseEvent,
        node: TreeNode
    ) => void;

    editingPath: string | null;
    editingName: string;
    setEditingName: (name: string) => void;

    onRename: () => void;
    onCancelRename: () => void;
};

export default function TreeItem({
    node,
    depth = 0,
    onOpenFile,
    onContextMenu,
    editingPath,
    editingName,
    setEditingName,
    onRename,
    onCancelRename,
}: Props) {
    const [open, setOpen] = useState(false);

    const editing = editingPath === node.path;

    const renderName = () => {
        if (editing) {
            return (
                <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onRename();
                        }

                        if (e.key === "Escape") {
                            onCancelRename();
                        }
                    }}
                    onBlur={onRename}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 text-xs text-zinc-200 outline-none focus:border-zinc-500"
                />
            );
        }

        return <span className="truncate">{node.name}</span>;
    };

    const paddingLeft = 12 + depth * 14;

    if (node.type === "file") {
        return (
            <div
                className="flex items-center gap-1.5 rounded py-1 pr-2 text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 cursor-pointer"
                style={{ paddingLeft }}
                onClick={() => onOpenFile(node)}
                onContextMenu={(e) => {
                    e.preventDefault();
                    onContextMenu(e, node);
                }}
            >
                <span className="shrink-0">📄</span>
                {renderName()}
            </div>
        );
    }

    return (
        <div>
            <div
                className="flex items-center gap-1.5 rounded py-1 pr-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/5 cursor-pointer"
                style={{ paddingLeft }}
                onClick={() => setOpen(!open)}
                onContextMenu={(e) => {
                    e.preventDefault();
                    onContextMenu(e, node);
                }}
            >
                <span className="shrink-0 text-[10px] text-zinc-500">
                    {open ? "▾" : "▸"}
                </span>
                <span className="shrink-0">{open ? "📂" : "📁"}</span>
                {renderName()}
            </div>

            {open &&
                node.children?.map((child) => (
                    <TreeItem
                        key={child.path}
                        node={child}
                        depth={depth + 1}
                        onOpenFile={onOpenFile}
                        onContextMenu={onContextMenu}
                        editingPath={editingPath}
                        editingName={editingName}
                        setEditingName={setEditingName}
                        onRename={onRename}
                        onCancelRename={onCancelRename}
                    />
                ))}
        </div>
    );
}
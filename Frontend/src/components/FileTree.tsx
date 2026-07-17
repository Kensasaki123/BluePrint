import type { MouseEvent } from "react";
import TreeItem, { TreeNode } from "./TreeItem";

type Props = {
    nodes: TreeNode[];
    currentFile: string | null;
    onFileClick: (node: TreeNode) => void;
    onContextMenu: (e: MouseEvent, node: TreeNode) => void;

    editingPath: string | null;
    editingName: string;
    setEditingName: (name: string) => void;

    onRename: () => void;
    onCancelRename: () => void;
};

export default function FileTree({
    nodes,
    onFileClick,
    onContextMenu,
    editingPath,
    editingName,
    setEditingName,
    onRename,
    onCancelRename
}: Props) {
    return (
        <>
            {nodes.map((node) => (
                <TreeItem
                    key={node.path}
                    node={node}
                    onOpenFile={onFileClick}
                    onContextMenu={onContextMenu}
                    editingPath={editingPath}
                    editingName={editingName}
                    setEditingName={setEditingName}
                    onRename={onRename}
                    onCancelRename={onCancelRename}

                />
            ))}
        </>
    );
}
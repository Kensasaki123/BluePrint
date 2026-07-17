import type { Editor } from "@tiptap/react";

export class FileFormatService {
    static load(editor: Editor, extension: string, content: string) {
        switch (extension) {
            case ".md":
                editor.commands.setContent(content, {
                    contentType: "markdown",
                });
                break;

            default:
                editor.commands.setContent(content);
        }
    }

    static save(editor: Editor, extension: string): string {
        switch (extension) {
            case ".md":
                return editor.getMarkdown();

            default:
                return editor.getText();
        }
    }
}
import { useState } from "react";
import { useSettingsStore } from "../Store/Gloabalstate";

interface VaultSetupProps {
    onVaultSelected(path: string): void;
}

export default function VaultSetup({ onVaultSelected }: VaultSetupProps) {

    const [loading, setLoading] = useState(false);
    const setVaultPath = useSettingsStore((s) => s.setVaultPath)
    const setting = useSettingsStore((s) => s.setting)

    async function chooseVault() {   setLoading(true);

        try {
            const path = await window.electron.vault.choose();
            if (!path) {
                return;
            }
            await window.electron.settings.save({
                vaultPath: path,
            });
            setVaultPath(path)
            console.log("Vault Path", setting)

            onVaultSelected(path);

        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#0a0a0c]">
        <div
            className="absolute inset-0"
            style={{
                backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
            }}
        />

        <div
            className="absolute inset-0"
            style={{
                background:
                    "radial-gradient(circle at center, transparent 0%, #0a0a0c 75%)",
            }}
        />

        <div className="absolute h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="relative flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-lg font-medium text-zinc-200">No vault open</h1>
                <p className="text-sm text-zinc-500">Choose a folder to start taking notes</p>
            </div>

            <button
                onClick={chooseVault}
                disabled={loading}
                className="group relative rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-100 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-600/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span className="flex items-center gap-2">
                    {loading && (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                    )}
                    {loading ? "Opening..." : "Choose Vault"}
                </span>
            </button>
        </div>
    </div>
);
}
import { useState } from "react";

interface VaultSetupProps {
    onVaultSelected(path: string): void;
}

export default function VaultSetup({ onVaultSelected }: VaultSetupProps) {

    const [loading, setLoading] = useState(false);

    async function chooseVault() {

        setLoading(true);

        try {

            const path = await window.electron.vault.choose();

            if (!path) {
                return;
            }

            await window.electron.settings.save({
                vaultPath: path,
            });

            onVaultSelected(path);

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <button
                onClick={chooseVault}
                disabled={loading}
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
                {loading ? "Opening..." : "Choose Vault"}
            </button>
        </div>
    );
}
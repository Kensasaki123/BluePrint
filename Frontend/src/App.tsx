import { useEffect, useState } from "react";
import VaultSetup from "./components/VaultSetup";
import MainApp from "./components/MainApp";

type Settings = {
    vaultPath: string | null;
};

export default function App() {

    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        async function load() {
            const s = await window.electron.settings.get();
            setSettings(s);
        }

        load();
    }, []);

    if (settings === null) {
        return <div>Loading...</div>;
    }

    if (settings.vaultPath === null) {
    return (
        <VaultSetup
            onVaultSelected={(path) => {
                setSettings({
                    vaultPath: path,
                });
            }}
        />
    );
}

    return <MainApp />;
}
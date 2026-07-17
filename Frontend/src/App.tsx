import { useEffect, useState } from "react";
import VaultSetup from "./components/VaultSetup";
import MainApp from "./components/MainApp";
import { useSettingsStore } from "./Store/Gloabalstate";

type Settings = {
    vaultPath: string | null;
};

export default function App() {
    const [settings, setSettings] = useState<Settings | null>(null); // useState hook which stores the settings
    const setSetting = useSettingsStore((s) => s.setSetting)

    // Automatically searches for the directory in the settings file we made through core electrom    
    useEffect(() => {
        async function load() {
            const s = await window.electron.settings.get();
            setSettings(s);
            setSetting(s)
        }

        load();
    }, []);

    if (settings === null) { // if settings file doesnt exist, simply shows loading
        return <div>Loading...</div>;
    }

    if (settings.vaultPath === null) { // if the vault path is empty, then sends you to the ValutSetup component for the dialog option
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
   // If not problem above then send you to MainApp, for now the MainApp doesn't contains the address of path of the vault
    return <MainApp onReset={() => setSettings({ vaultPath: null})} />;
}
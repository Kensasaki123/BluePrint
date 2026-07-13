export {};

declare global {
  interface Window {
    electron: {
      vault: {
        choose(): Promise<string | null>;
      };

      notes: {
        save(): Promise<void>;
        read(): Promise<void>;
      };

      settings: {
        get(): Promise<{
          vaultPath: string | null;
        }>;

        save(settings: {
          vaultPath: string | null;
        }): Promise<void>;
      };
    };
  }
}
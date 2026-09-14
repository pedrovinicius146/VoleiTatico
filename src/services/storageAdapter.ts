/**
 * Interface abstrata de armazenamento para persistência local ou remota.
 * Permite desacoplar a lógica de negócio do ambiente de execução (Web vs React Native / Flutter / Ionic).
 *
 * Web: localStorage / IndexedDB
 * React Native: @react-native-async-storage/async-storage
 * Flutter: SharedPreferences / Hive
 */
export interface IStorageAdapter {
  getItem<T = unknown>(key: string): T | null;
  setItem<T = unknown>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

class WebLocalStorageAdapter implements IStorageAdapter {
  getItem<T = unknown>(key: string): T | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[StorageAdapter] Erro ao ler a chave "${key}":`, err);
      return null;
    }
  }

  setItem<T = unknown>(key: string, value: T): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[StorageAdapter] Erro ao gravar a chave "${key}":`, err);
    }
  }

  removeItem(key: string): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[StorageAdapter] Erro ao remover a chave "${key}":`, err);
    }
  }

  clear(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.clear();
    } catch (err) {
      console.warn('[StorageAdapter] Erro ao limpar armazenamento:', err);
    }
  }
}

export const defaultStorage: IStorageAdapter = new WebLocalStorageAdapter();

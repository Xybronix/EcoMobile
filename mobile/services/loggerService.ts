import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

const DOCUMENT_DIRECTORY = FileSystem.documentDirectory || '';

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  data?: any;
  url?: string;
  method?: string;
  status?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class LoggerService {
  private static instance: LoggerService;
  private logDir: string;
  private logFile: string;
  private maxLogSize = 5 * 1024 * 1024; // 5MB max
  private maxLogEntries = 1000; // Maximum d'entrées à garder en mémoire

  private constructor() {
    this.logDir = `${DOCUMENT_DIRECTORY}logs/`;
    this.logFile = `${this.logDir}app-logs.json`;
    // Ne pas appeler initializeLogDir ici car c'est asynchrone
    // On l'appellera lors des écritures
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private async initializeLogDir(): Promise<boolean> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.logDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.logDir, { intermediates: true });
        console.log('[Logger] Log directory created');
      }
      return true;
    } catch (error) {
      console.error('[Logger] Error initializing log directory:', error);
      return false;
    }
  }

  /**
   * Enregistre une erreur API
   */
  public async logApiError(
    message: string,
    url: string,
    method: string = 'GET',
    status?: number,
    errorData?: any
  ): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      url,
      method,
      status,
      data: errorData,
    };

    await this.writeLog(logEntry);
    
    // Afficher en console en développement
    if (__DEV__) {
      console.error(`[API Error] ${method} ${url} - Status: ${status} - ${message}`, errorData);
    }
  }

  /**
   * Enregistre une erreur générale
   */
  public async logError(
    message: string,
    error?: Error,
    context?: Record<string, any>
  ): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      data: context,
    };

    await this.writeLog(logEntry);
    
    if (__DEV__) {
      console.error(`[Error] ${message}`, error, context);
    }
  }

  /**
   * Enregistre un avertissement
   */
  public async logWarning(
    message: string,
    data?: any
  ): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      data,
    };

    await this.writeLog(logEntry);
    
    if (__DEV__) {
      console.warn(`[Warning] ${message}`, data);
    }
  }

  /**
   * Enregistre une information
   */
  public async logInfo(
    message: string,
    data?: any
  ): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      data,
    };

    await this.writeLog(logEntry);
    
    if (__DEV__) {
      console.log(`[Info] ${message}`, data);
    }
  }

  /**
   * Écrit un log dans le fichier
   */
  private async writeLog(entry: LogEntry): Promise<void> {
    try {
      // Initialiser le dossier si nécessaire
      const dirInitialized = await this.initializeLogDir();
      if (!dirInitialized) {
        // Si on ne peut pas initialiser le dossier, on log seulement en console
        if (__DEV__) {
          console.log('[Logger] Using console only mode');
        }
        return;
      }
      
      // Lire les logs existants
      let logs: LogEntry[] = [];
      try {
        const fileInfo = await FileSystem.getInfoAsync(this.logFile);
        if (fileInfo.exists) {
          const fileContent = await FileSystem.readAsStringAsync(this.logFile);
          logs = JSON.parse(fileContent);
        }
      } catch (error) {
        // Si le fichier est corrompu, on recommence
        logs = [];
      }

      // Ajouter le nouveau log
      logs.push(entry);

      // Limiter le nombre de logs (garder les plus récents)
      if (logs.length > this.maxLogEntries) {
        logs = logs.slice(-this.maxLogEntries);
      }

      // Écrire dans le fichier
      await FileSystem.writeAsStringAsync(
        this.logFile,
        JSON.stringify(logs, null, 2)
      );

      // Vérifier la taille du fichier et nettoyer si nécessaire
      await this.cleanupLogs();
    } catch (error) {
      // Ne pas bloquer l'application en cas d'erreur de logging
      if (__DEV__) {
        console.error('[Logger] Error writing log:', error);
      }
    }
  }

  /**
   * Nettoie les logs si le fichier devient trop volumineux
   */
  private async cleanupLogs(): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.logFile);
      if (fileInfo.exists && fileInfo.size && fileInfo.size > this.maxLogSize) {
        // Lire les logs
        const fileContent = await FileSystem.readAsStringAsync(this.logFile);
        let logs: LogEntry[] = JSON.parse(fileContent);

        // Garder seulement les 500 entrées les plus récentes
        logs = logs.slice(-500);

        // Réécrire le fichier
        await FileSystem.writeAsStringAsync(
          this.logFile,
          JSON.stringify(logs, null, 2)
        );
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Logger] Error cleaning up logs:', error);
      }
    }
  }

  /**
   * Récupère tous les logs
   */
  public async getLogs(): Promise<LogEntry[]> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.logFile);
      if (!fileInfo.exists) {
        return [];
      }

      const fileContent = await FileSystem.readAsStringAsync(this.logFile);
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('[Logger] Error reading logs:', error);
      return [];
    }
  }

  /**
   * Récupère les logs d'erreur uniquement
   */
  public async getErrorLogs(): Promise<LogEntry[]> {
    const logs = await this.getLogs();
    return logs.filter(log => log.level === 'error');
  }

  /**
   * Exporte les logs en format texte lisible
   */
  public async exportLogsAsText(): Promise<string> {
    const logs = await this.getLogs();
    
    let text = `=== Application Logs ===\n`;
    text += `Generated: ${new Date().toISOString()}\n`;
    text += `Platform: ${Platform.OS} ${Platform.Version}\n`;
    text += `Total entries: ${logs.length}\n\n`;

    logs.forEach((log, index) => {
      text += `\n[${index + 1}] ${log.timestamp} [${log.level.toUpperCase()}]\n`;
      text += `Message: ${log.message}\n`;
      
      if (log.url) {
        text += `URL: ${log.method || 'GET'} ${log.url}\n`;
      }
      
      if (log.status) {
        text += `Status: ${log.status}\n`;
      }
      
      if (log.error) {
        text += `Error: ${log.error.name} - ${log.error.message}\n`;
        if (log.error.stack) {
          text += `Stack: ${log.error.stack}\n`;
        }
      }
      
      if (log.data) {
        text += `Data: ${JSON.stringify(log.data, null, 2)}\n`;
      }
      
      text += `\n${'-'.repeat(50)}\n`;
    });

    return text;
  }

  /**
   * Partage les logs (via expo-sharing)
   */
  public async shareLogs(): Promise<boolean> {
    try {
      const textLogs = await this.exportLogsAsText();
      const textFile = `${this.logDir}app-logs-${Date.now()}.txt`;
      
      await FileSystem.writeAsStringAsync(textFile, textLogs);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(textFile, {
          mimeType: 'text/plain',
          dialogTitle: 'Partager les logs',
        });
        return true;
      } else {
        console.warn('[Logger] Sharing is not available on this platform');
        return false;
      }
    } catch (error) {
      console.error('[Logger] Error sharing logs:', error);
      return false;
    }
  }

  /**
   * Supprime tous les logs
   */
  public async clearLogs(): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.logFile);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(this.logFile);
      }
    } catch (error) {
      console.error('[Logger] Error clearing logs:', error);
    }
  }

  /**
   * Récupère les informations sur les logs
   */
  public async getLogInfo(): Promise<{
    exists: boolean;
    size: number;
    entryCount: number;
    errorCount: number;
    lastError?: LogEntry;
  }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.logFile);
      if (!fileInfo.exists) {
        return {
          exists: false,
          size: 0,
          entryCount: 0,
          errorCount: 0,
        };
      }

      const logs = await this.getLogs();
      const errors = logs.filter(log => log.level === 'error');
      const lastError = errors.length > 0 ? errors[errors.length - 1] : undefined;

      return {
        exists: true,
        size: fileInfo.size || 0,
        entryCount: logs.length,
        errorCount: errors.length,
        lastError,
      };
    } catch (error) {
      console.error('[Logger] Error getting log info:', error);
      return {
        exists: false,
        size: 0,
        entryCount: 0,
        errorCount: 0,
      };
    }
  }
}

export const loggerService = LoggerService.getInstance();
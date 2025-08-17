class StorageManager {
    constructor() {
        this.keys = {
            CAR_NAME: 'carcare_car_name',
            MAINTENANCE_LOGS: 'carcare_maintenance_logs',
            THEME: 'carcare_theme',
            FIRST_TIME: 'carcare_first_time',
            LANGUAGE: 'carcare_language'
        };
    }
    // Language methods
    setLanguage(lang) {
        localStorage.setItem(this.keys.LANGUAGE, lang);
    }

    getLanguage() {
        return localStorage.getItem(this.keys.LANGUAGE) || 'system';
    }

    // Car name methods
    setCarName(name) {
        localStorage.setItem(this.keys.CAR_NAME, name);
    }

    getCarName() {
        return localStorage.getItem(this.keys.CAR_NAME) || 'My Car';
    }

    // Theme methods
    setTheme(theme) {
        localStorage.setItem(this.keys.THEME, theme);
    }

    getTheme() {
        return localStorage.getItem(this.keys.THEME) || 'system';
    }

    // First time user check
    isFirstTime() {
        return !localStorage.getItem(this.keys.FIRST_TIME);
    }

    setFirstTimeComplete() {
        localStorage.setItem(this.keys.FIRST_TIME, 'false');
    }

    // Maintenance logs methods
    getMaintenanceLogs() {
        const logs = localStorage.getItem(this.keys.MAINTENANCE_LOGS);
        return logs ? JSON.parse(logs) : [];
    }

    saveMaintenanceLogs(logs) {
        localStorage.setItem(this.keys.MAINTENANCE_LOGS, JSON.stringify(logs));
    }

    addMaintenanceEntry(entry) {
        const logs = this.getMaintenanceLogs();
        const newEntry = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            ...entry
        };
        logs.unshift(newEntry);
        this.saveMaintenanceLogs(logs);
        return newEntry;
    }

    updateMaintenanceEntry(id, updatedEntry) {
        const logs = this.getMaintenanceLogs();
        const index = logs.findIndex(log => log.id === id);
        if (index !== -1) {
            logs[index] = { ...logs[index], ...updatedEntry };
            this.saveMaintenanceLogs(logs);
            return logs[index];
        }
        return null;
    }

    deleteMaintenanceEntry(id) {
        const logs = this.getMaintenanceLogs();
        const filteredLogs = logs.filter(log => log.id !== id);
        this.saveMaintenanceLogs(filteredLogs);
        return filteredLogs;
    }

    // Export/Import methods
    exportData() {
        const data = {
            carName: this.getCarName(),
            theme: this.getTheme(),
            maintenanceLogs: this.getMaintenanceLogs(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validate data structure
            if (!data.version || !data.maintenanceLogs) {
                throw new Error('Invalid data format');
            }

            // Import car name if available
            if (data.carName) {
                this.setCarName(data.carName);
            }

            // Import theme if available
            if (data.theme) {
                this.setTheme(data.theme);
            }

            // Import maintenance logs
            if (Array.isArray(data.maintenanceLogs)) {
                this.saveMaintenanceLogs(data.maintenanceLogs);
            }

            return {
                success: true,
                message: `Successfully imported ${data.maintenanceLogs.length} entries`
            };
        } catch (error) {
            return {
                success: false,
                message: `Import failed: ${error.message}`
            };
        }
    }

    // Search and filter methods
    searchMaintenanceLogs(searchTerm, filterType = '') {
        const logs = this.getMaintenanceLogs();
        let filteredLogs = logs;

        // Filter by type
        if (filterType) {
            filteredLogs = filteredLogs.filter(log => log.type === filterType);
        }

        // Search by term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredLogs = filteredLogs.filter(log =>
                log.description?.toLowerCase().includes(term) ||
                log.notes?.toLowerCase().includes(term) ||
                log.type?.toLowerCase().includes(term)
            );
        }

        return filteredLogs;
    }

    // Statistics methods
    getStatistics() {
        const logs = this.getMaintenanceLogs();
        const totalEntries = logs.length;
        const totalCost = logs.reduce((sum, log) => sum + (parseFloat(log.cost) || 0), 0);
        const lastService = logs.length > 0 ? new Date(logs[0].date) : null;

        return {
            totalEntries,
            totalCost: totalCost.toFixed(2),
            lastService: lastService ? this.formatDate(lastService) : 'Never'
        };
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Clear all data
    clearAllData() {
        Object.values(this.keys).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    // Get maintenance type icon
    getMaintenanceTypeIcon(type) {
        const icons = {
            'oil-change': 'fas fa-oil-can',
            'tire-rotation': 'fas fa-sync-alt',
            'brake-service': 'fas fa-hand-paper',
            'inspection': 'fas fa-search',
            'repair': 'fas fa-wrench',
            'other': 'fas fa-tools'
        };
        return icons[type] || icons.other;
    }

    // Get maintenance type display name
    getMaintenanceTypeDisplayName(type) {
        const names = {
            'oil-change': 'Oil Change',
            'tire-rotation': 'Tire Rotation',
            'brake-service': 'Brake Service',
            'inspection': 'Inspection',
            'repair': 'Repair',
            'other': 'Other'
        };
        return names[type] || 'Other';
    }

    // Get upcoming maintenance
    getUpcomingMaintenance() {
        const logs = this.getMaintenanceLogs();
        const upcoming = logs
            .filter(log => log.nextDue && new Date(log.nextDue) > new Date())
            .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));
        
        return upcoming;
    }

    // Get overdue maintenance
    getOverdueMaintenance() {
        const logs = this.getMaintenanceLogs();
        const overdue = logs
            .filter(log => log.nextDue && new Date(log.nextDue) < new Date())
            .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));
        
        return overdue;
    }
}

// Export for use in other files
window.StorageManager = StorageManager;




// class StorageManager {
//     constructor() {
//         this.keys = {
//             CAR_NAME: 'carcare_car_name',
//             MAINTENANCE_LOGS: 'carcare_maintenance_logs',
//             THEME: 'carcare_theme',
//             LANGUAGE: 'carcare_language',
//             FIRST_TIME: 'carcare_first_time'
//         };
//     }

//     // Language methods
//     setLanguage(lang) {
//         localStorage.setItem(this.keys.LANGUAGE, lang);
//     }

//     getLanguage() {
//         return localStorage.getItem(this.keys.LANGUAGE) || 'system';
//     }

//     // Car name methods
//     setCarName(name) {
//         localStorage.setItem(this.keys.CAR_NAME, name);
//     }

//     getCarName() {
//         return localStorage.getItem(this.keys.CAR_NAME) || 'My Car';
//     }

//     // Theme methods
//     setTheme(theme) {
//         localStorage.setItem(this.keys.THEME, theme);
//     }

//     getTheme() {
//         return localStorage.getItem(this.keys.THEME) || 'system';
//     }

//     // First time user check
//     isFirstTime() {
//         return !localStorage.getItem(this.keys.FIRST_TIME);
//     }

//     setFirstTimeComplete() {
//         localStorage.setItem(this.keys.FIRST_TIME, 'false');
//     }

//     // Maintenance logs methods
//     getMaintenanceLogs() {
//         const logs = localStorage.getItem(this.keys.MAINTENANCE_LOGS);
//         return logs ? JSON.parse(logs) : [];
//     }

//     saveMaintenanceLogs(logs) {
//         localStorage.setItem(this.keys.MAINTENANCE_LOGS, JSON.stringify(logs));
//     }

//     addMaintenanceEntry(entry) {
//         const logs = this.getMaintenanceLogs();
//         const newEntry = {
//             id: this.generateId(),
//             timestamp: new Date().toISOString(),
//             ...entry
//         };
//         logs.unshift(newEntry);
//         this.saveMaintenanceLogs(logs);
//         return newEntry;
//     }

//     updateMaintenanceEntry(id, updatedEntry) {
//         const logs = this.getMaintenanceLogs();
//         const index = logs.findIndex(log => log.id === id);
//         if (index !== -1) {
//             logs[index] = { ...logs[index], ...updatedEntry };
//             this.saveMaintenanceLogs(logs);
//             return logs[index];
//         }
//         return null;
//     }

//     deleteMaintenanceEntry(id) {
//         const logs = this.getMaintenanceLogs();
//         const filteredLogs = logs.filter(log => log.id !== id);
//         this.saveMaintenanceLogs(filteredLogs);
//         return filteredLogs;
//     }

//     // Export/Import methods
//     exportData() {
//         const data = {
//             carName: this.getCarName(),
//             theme: this.getTheme(),
//             maintenanceLogs: this.getMaintenanceLogs(),
//             exportDate: new Date().toISOString(),
//             version: '1.0'
//         };
//         return JSON.stringify(data, null, 2);
//     }

//     importData(jsonData) {
//         try {
//             const data = JSON.parse(jsonData);
            
//             // Validate data structure
//             if (!data.version || !data.maintenanceLogs) {
//                 throw new Error('Invalid data format');
//             }

//             // Import car name if available
//             if (data.carName) {
//                 this.setCarName(data.carName);
//             }

//             // Import theme if available
//             if (data.theme) {
//                 this.setTheme(data.theme);
//             }

//             // Import maintenance logs
//             if (Array.isArray(data.maintenanceLogs)) {
//                 this.saveMaintenanceLogs(data.maintenanceLogs);
//             }

//             return {
//                 success: true,
//                 message: `Successfully imported ${data.maintenanceLogs.length} entries`
//             };
//         } catch (error) {
//             return {
//                 success: false,
//                 message: `Import failed: ${error.message}`
//             };
//         }
//     }

//     // Search and filter methods
//     searchMaintenanceLogs(searchTerm, filterType = '') {
//         const logs = this.getMaintenanceLogs();
//         let filteredLogs = logs;

//         // Filter by type
//         if (filterType) {
//             filteredLogs = filteredLogs.filter(log => log.type === filterType);
//         }

//         // Search by term
//         if (searchTerm) {
//             const term = searchTerm.toLowerCase();
//             filteredLogs = filteredLogs.filter(log =>
//                 log.description?.toLowerCase().includes(term) ||
//                 log.notes?.toLowerCase().includes(term) ||
//                 log.type?.toLowerCase().includes(term)
//             );
//         }

//         return filteredLogs;
//     }

//     // Statistics methods
//     getStatistics() {
//         const logs = this.getMaintenanceLogs();
//         const totalEntries = logs.length;
//         const totalCost = logs.reduce((sum, log) => sum + (parseFloat(log.cost) || 0), 0);
//         const lastService = logs.length > 0 ? new Date(logs[0].date) : null;

//         return {
//             totalEntries,
//             totalCost: totalCost.toFixed(2),
//             lastService: lastService ? this.formatDate(lastService) : 'Never'
//         };
//     }

//     // Utility methods
//     generateId() {
//         return Date.now().toString(36) + Math.random().toString(36).substr(2);
//     }

//     formatDate(date) {
//         if (typeof date === 'string') {
//             date = new Date(date);
//         }
//         return date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     }

//     formatDateTime(date) {
//         if (typeof date === 'string') {
//             date = new Date(date);
//         }
//         return date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         });
//     }

//     // Clear all data
//     clearAllData() {
//         Object.values(this.keys).forEach(key => {
//             localStorage.removeItem(key);
//         });
//     }

//     // Get maintenance type icon
//     getMaintenanceTypeIcon(type) {
//         const icons = {
//             'oil-change': 'fas fa-oil-can',
//             'tire-rotation': 'fas fa-sync-alt',
//             'brake-service': 'fas fa-hand-paper',
//             'inspection': 'fas fa-search',
//             'repair': 'fas fa-wrench',
//             'other': 'fas fa-tools'
//         };
//         return icons[type] || icons.other;
//     }

//     // Get maintenance type display name
//     getMaintenanceTypeDisplayName(type) {
//         const names = {
//             'oil-change': 'Oil Change',
//             'tire-rotation': 'Tire Rotation',
//             'brake-service': 'Brake Service',
//             'inspection': 'Inspection',
//             'repair': 'Repair',
//             'other': 'Other'
//         };
//         return names[type] || 'Other';
//     }

//     // Get upcoming maintenance
//     getUpcomingMaintenance() {
//         const logs = this.getMaintenanceLogs();
//         const upcoming = logs
//             .filter(log => log.nextDue && new Date(log.nextDue) > new Date())
//             .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));
        
//         return upcoming;
//     }

//     // Get overdue maintenance
//     getOverdueMaintenance() {
//         const logs = this.getMaintenanceLogs();
//         const overdue = logs
//             .filter(log => log.nextDue && new Date(log.nextDue) < new Date())
//             .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));
        
//         return overdue;
//     }
// }

// // Export for use in other files
// window.StorageManager = StorageManager;
// Main application entry point
class CarCareApp {
    constructor() {
        this.storage = new StorageManager();
        this.ui = new UIManager(this.storage);
        this.init();
    }

    init() {
        // Check if this is the first time user
        if (this.storage.isFirstTime()) {
            this.showWelcomeScreen();
        } else {
            this.showMainApp();
        }

        // Initialize service worker for potential offline functionality
        this.registerServiceWorker();
        
        // Set up periodic reminders check
        this.setupMaintenanceReminders();
    }

    showWelcomeScreen() {
        document.getElementById('welcome-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        // Set car name in navigation
        const carName = this.storage.getCarName();
        document.getElementById('nav-car-name').textContent = carName;
        
        // Update statistics and render logs
        this.ui.updateStatistics();
        this.ui.renderMaintenanceLogs();
        
        // Check for overdue maintenance
        this.checkOverdueMaintenance();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            // For future offline functionality
            console.log('Service Worker support detected');
        }
    }

    setupMaintenanceReminders() {
        // Check for upcoming maintenance every time the app loads
        const upcoming = this.storage.getUpcomingMaintenance();
        const overdue = this.storage.getOverdueMaintenance();
        
        if (overdue.length > 0) {
            setTimeout(() => {
                this.ui.showNotification(
                    `You have ${overdue.length} overdue maintenance item(s)!`,
                    'error'
                );
            }, 2000);
        } else if (upcoming.length > 0) {
            const nextUpcoming = upcoming[0];
            const daysUntil = Math.ceil((new Date(nextUpcoming.nextDue) - new Date()) / (1000 * 60 * 60 * 24));
            
            if (daysUntil <= 7) {
                setTimeout(() => {
                    this.ui.showNotification(
                        `${this.storage.getMaintenanceTypeDisplayName(nextUpcoming.type)} due in ${daysUntil} days`,
                        'warning'
                    );
                }, 3000);
            }
        }
    }

    checkOverdueMaintenance() {
        const overdue = this.storage.getOverdueMaintenance();
        if (overdue.length > 0) {
            // Could add a visual indicator or notification here
            console.log(`${overdue.length} overdue maintenance items found`);
        }
    }

    // Utility methods for potential future features
    scheduleReminder(entryId, reminderDate) {
        // Future: Implement browser notifications
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notifications enabled for maintenance reminders');
                }
            });
        }
    }

    exportToCalendar() {
        // Future: Export upcoming maintenance to calendar
        const upcoming = this.storage.getUpcomingMaintenance();
        console.log('Future feature: Export to calendar', upcoming);
    }

    generateMaintenanceSchedule() {
        // Future: Generate recommended maintenance schedule based on mileage and time
        const logs = this.storage.getMaintenanceLogs();
        console.log('Future feature: Generate maintenance schedule', logs);
    }
}

// Enhanced error handling
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    // Could show user-friendly error message
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.carCareApp = new CarCareApp();
        window.storageManager = window.carCareApp.storage;
        window.uiManager = window.carCareApp.ui;
        
        console.log('CarCare Log initialized successfully');
    } catch (error) {
        console.error('Failed to initialize CarCare Log:', error);
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem;">
                <div>
                    <h1 style="color: #dc2626; margin-bottom: 1rem;">Initialization Error</h1>
                    <p>Sorry, there was a problem loading CarCare Log.</p>
                    <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Reload App
                    </button>
                </div>
            </div>
        `;
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: New entry
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (window.uiManager && !document.querySelector('.modal.show')) {
            window.uiManager.showAddEntryModal();
        }
    }
    
    // Ctrl/Cmd + S: Settings
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        if (window.uiManager && !document.querySelector('.modal.show')) {
            window.uiManager.showSettingsModal();
        }
    }
    
    // Escape: Close modal
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal && window.uiManager) {
            window.uiManager.closeModal(openModal.id);
        }
    }
});

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
    // Future: Handle routing if we implement multiple views
});

// Auto-save protection
window.addEventListener('beforeunload', (e) => {
    // Check if there are unsaved changes in forms
    const forms = document.querySelectorAll('form');
    for (let form of forms) {
        if (form.checkValidity && form.checkValidity() === false) {
            // Don't show warning for empty forms
            continue;
        }
        const formData = new FormData(form);
        let hasData = false;
        for (let [key, value] of formData.entries()) {
            if (value && value.toString().trim()) {
                hasData = true;
                break;
            }
        }
        if (hasData && form.closest('.modal.show')) {
            e.preventDefault();
            e.returnValue = '';
            break;
        }
    }
});

// // Main application entry point
// class CarCareApp {
//     constructor() {
//         this.storage = new StorageManager();
//         this.ui = new UIManager(this.storage);
//         this.init();
//     }

//     init() {
//         // Apply language before showing any UI
//         const savedLang = this.storage.getLanguage();
//         this.ui.applyLanguage(savedLang);

//         // Check if this is the first time user
//         if (this.storage.isFirstTime()) {
//             this.showWelcomeScreen();
//         } else {
//             this.showMainApp();
//         }

//         // Initialize service worker for potential offline functionality
//         this.registerServiceWorker();
        
//         // Set up periodic reminders check
//         this.setupMaintenanceReminders();
//     }

//     showWelcomeScreen() {
//         document.getElementById('welcome-screen').classList.remove('hidden');
//         document.getElementById('main-app').classList.add('hidden');
//     }

//     showMainApp() {
//         document.getElementById('welcome-screen').classList.add('hidden');
//         document.getElementById('main-app').classList.remove('hidden');
        
//         // Set car name in navigation
//         const carName = this.storage.getCarName();
//         document.getElementById('nav-car-name').textContent = carName;
        
//         // Update statistics and render logs
//         this.ui.updateStatistics();
//         this.ui.renderMaintenanceLogs();
        
//         // Check for overdue maintenance
//         this.checkOverdueMaintenance();
//     }

//     registerServiceWorker() {
//         if ('serviceWorker' in navigator) {
//             // For future offline functionality
//             console.log('Service Worker support detected');
//         }
//     }

//     setupMaintenanceReminders() {
//         // Check for upcoming maintenance every time the app loads
//         const upcoming = this.storage.getUpcomingMaintenance();
//         const overdue = this.storage.getOverdueMaintenance();
        
//         if (overdue.length > 0) {
//             setTimeout(() => {
//                 this.ui.showNotification(
//                     `You have ${overdue.length} overdue maintenance item(s)!`,
//                     'error'
//                 );
//             }, 2000);
//         } else if (upcoming.length > 0) {
//             const nextUpcoming = upcoming[0];
//             const daysUntil = Math.ceil((new Date(nextUpcoming.nextDue) - new Date()) / (1000 * 60 * 60 * 24));
            
//             if (daysUntil <= 7) {
//                 setTimeout(() => {
//                     this.ui.showNotification(
//                         `${this.storage.getMaintenanceTypeDisplayName(nextUpcoming.type)} due in ${daysUntil} days`,
//                         'warning'
//                     );
//                 }, 3000);
//             }
//         }
//     }

//     checkOverdueMaintenance() {
//         const overdue = this.storage.getOverdueMaintenance();
//         if (overdue.length > 0) {
//             // Could add a visual indicator or notification here
//             console.log(`${overdue.length} overdue maintenance items found`);
//         }
//     }

//     // Utility methods for potential future features
//     scheduleReminder(entryId, reminderDate) {
//         // Future: Implement browser notifications
//         if ('Notification' in window) {
//             Notification.requestPermission().then(permission => {
//                 if (permission === 'granted') {
//                     console.log('Notifications enabled for maintenance reminders');
//                 }
//             });
//         }
//     }

//     exportToCalendar() {
//         // Future: Export upcoming maintenance to calendar
//         const upcoming = this.storage.getUpcomingMaintenance();
//         console.log('Future feature: Export to calendar', upcoming);
//     }

//     generateMaintenanceSchedule() {
//         // Future: Generate recommended maintenance schedule based on mileage and time
//         const logs = this.storage.getMaintenanceLogs();
//         console.log('Future feature: Generate maintenance schedule', logs);
//     }
// }

// // Enhanced error handling
// window.addEventListener('error', (event) => {
//     console.error('Application error:', event.error);
//     // Could show user-friendly error message
// });

// window.addEventListener('unhandledrejection', (event) => {
//     console.error('Unhandled promise rejection:', event.reason);
//     event.preventDefault();
// });

// // // Initialize app when DOM is loaded
// // document.addEventListener('DOMContentLoaded', () => {
// //     try {
// //         window.carCareApp = new CarCareApp();
// //         window.storageManager = window.carCareApp.storage;
// //         window.uiManager = window.carCareApp.ui;
        
// //         console.log('CarCare Log initialized successfully');
// //     } catch (error) {
// //         console.error('Failed to initialize CarCare Log:', error);
// //         document.body.innerHTML = `
// //             <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem;">
// //                 <div>
// //                     <h1 style="color: #dc2626; margin-bottom: 1rem;">Initialization Error</h1>
// //                     <p>Sorry, there was a problem loading CarCare Log.</p>
// //                     <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
// //                         Reload App
// //                     </button>
// //                 </div>
// //             </div>
// //         `;
// //     }
// // });
// // document.addEventListener('DOMContentLoaded', () => {
// //     try {
// //         // Verify essential DOM elements exist
// //         const requiredElements = [
// //             'welcome-screen', 
// //             'main-app',
// //             'nav-car-name',
// //             'car-name-input'
// //         ];
        
// //         for (const id of requiredElements) {
// //             if (!document.getElementById(id)) {
// //                 throw new Error(`Required element #${id} not found`);
// //             }
// //         }

// //         window.carCareApp = new CarCareApp();
// //         window.storageManager = window.carCareApp.storage;
// //         window.uiManager = window.carCareApp.ui;
        
// //         console.log('CarCare Log initialized successfully');
// //     } catch (error) {
// //         console.error('Failed to initialize CarCare Log:', error);
// //         document.body.innerHTML = `
// //             <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem;">
// //                 <div>
// //                     <h1 style="color: #dc2626; margin-bottom: 1rem;">Initialization Error</h1>
// //                     <p>Sorry, there was a problem loading CarCare Log.</p>
// //                     <p style="color: #6b7280; font-size: 0.875rem;">${error.message}</p>
// //                     <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
// //                         Reload App
// //                     </button>
// //                 </div>
// //             </div>
// //         `;
// //     }
// // });
// document.addEventListener('DOMContentLoaded', () => {
//     try {
//         // Check if required elements exist
//         const requiredElements = [
//             'welcome-screen',
//             'main-app',
//             'nav-car-name',
//             'car-name-input',
//             'start-btn'
//         ];

//         for (const id of requiredElements) {
//             if (!document.getElementById(id)) {
//                 throw new Error(`Required element #${id} not found`);
//             }
//         }

//         window.carCareApp = new CarCareApp();
//         window.storageManager = window.carCareApp.storage;
//         window.uiManager = window.carCareApp.ui;
        
//         console.log('CarCare Log initialized successfully');
//     } catch (error) {
//         console.error('Failed to initialize CarCare Log:', error);
//         showErrorScreen(error);
//     }
// });

// function showErrorScreen(error) {
//     document.body.innerHTML = `
//         <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem;">
//             <div>
//                 <h1 style="color: #dc2626; margin-bottom: 1rem;">Initialization Error</h1>
//                 <p>Sorry, there was a problem loading CarCare Log.</p>
//                 <p style="color: #6b7280; font-size: 0.875rem; margin-top: 1rem;">${error.message}</p>
//                 <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; margin-top: 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
//                     Reload App
//                 </button>
//             </div>
//         </div>
//     `;
// }
// // Keyboard shortcuts
// document.addEventListener('keydown', (e) => {
//     // Ctrl/Cmd + N: New entry
//     if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
//         e.preventDefault();
//         if (window.uiManager && !document.querySelector('.modal.show')) {
//             window.uiManager.showAddEntryModal();
//         }
//     }
    
//     // Ctrl/Cmd + S: Settings
//     if ((e.ctrlKey || e.metaKey) && e.key === ',') {
//         e.preventDefault();
//         if (window.uiManager && !document.querySelector('.modal.show')) {
//             window.uiManager.showSettingsModal();
//         }
//     }
    
//     // Escape: Close modal
//     if (e.key === 'Escape') {
//         const openModal = document.querySelector('.modal.show');
//         if (openModal && window.uiManager) {
//             window.uiManager.closeModal(openModal.id);
//         }
//     }
// });

// // Handle browser back/forward
// window.addEventListener('popstate', (e) => {
//     // Future: Handle routing if we implement multiple views
// });

// // Auto-save protection
// window.addEventListener('beforeunload', (e) => {
//     // Check if there are unsaved changes in forms
//     const forms = document.querySelectorAll('form');
//     for (let form of forms) {
//         if (form.checkValidity && form.checkValidity() === false) {
//             // Don't show warning for empty forms
//             continue;
//         }
//         const formData = new FormData(form);
//         let hasData = false;
//         for (let [key, value] of formData.entries()) {
//             if (value && value.toString().trim()) {
//                 hasData = true;
//                 break;
//             }
//         }
//         if (hasData && form.closest('.modal.show')) {
//             e.preventDefault();
//             e.returnValue = '';
//             break;
//         }
//     }
// });
class UIManager {
    constructor(storageManager) {
        this.storage = storageManager;
        this.currentView = 'dashboard';
        this.currentLang = this.storage.getLanguage();
        this.init();
    }
    
  initializeLanguage() {
        const savedLang = this.storage.getLanguage();
        this.applyLanguage(savedLang);
        
        // Set radio button
        const langRadio = document.querySelector(`input[name="language"][value="${savedLang}"]`);
        if (langRadio) {
            langRadio.checked = true;
        }
    }

    applyLanguage(lang) {
        this.currentLang = lang;
        this.storage.setLanguage(lang);
        
        const translations = getTranslations(lang);
        this.updateUIText(translations);
        
        // Set document direction
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }

    updateUIText(translations) {
        // Update all UI elements with translations
        document.getElementById('nav-car-name').textContent = translations.appTitle;
        document.querySelector('.welcome-container h1').textContent = translations.welcomeTitle;
        document.querySelector('.welcome-container p').textContent = translations.welcomeSubtitle;
        document.getElementById('car-name-input').placeholder = translations.carNamePlaceholder;
        document.getElementById('start-btn').innerHTML = `<i class="fas fa-arrow-right"></i> ${translations.getStarted}`;
        document.getElementById('add-entry-btn').innerHTML = `<i class="fas fa-plus"></i> ${translations.addEntry}`;
        document.getElementById('settings-btn').innerHTML = `<i class="fas fa-cog"></i> ${translations.settings}`;
        document.querySelector('.stat-content p:nth-child(1)').textContent = translations.totalEntries;
        document.querySelector('.stat-content p:nth-child(2)').textContent = translations.totalCost;
        document.querySelector('.stat-content p:nth-child(3)').textContent = translations.lastService;
        document.getElementById('search-input').placeholder = translations.searchPlaceholder;
        document.querySelector('#filter-type option[value=""]').textContent = translations.allCategories;
        document.querySelector('.logs-header h2').textContent = translations.maintenanceHistory;
        document.getElementById('export-pdf-btn').innerHTML = `<i class="fas fa-file-pdf"></i> ${translations.exportPDF}`;
        document.getElementById('export-data-btn').innerHTML = `<i class="fas fa-download"></i> ${translations.exportData}`;
        document.querySelector('.no-logs h3').textContent = translations.noRecords;
        document.querySelector('.no-logs button').innerHTML = `<i class="fas fa-plus"></i> ${translations.addFirstEntry}`;
        // Add all other elements that need translation...
    }

    init() {
        this.initializeTheme();
        this.bindEvents();
        this.updateStatistics();
        this.renderMaintenanceLogs();
    }

    initializeTheme() {
        const savedTheme = this.storage.getTheme();
        this.applyTheme(savedTheme);
        
        // Set radio button
        const themeRadio = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
        if (themeRadio) {
            themeRadio.checked = true;
        }
    }

    applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            html.setAttribute('data-theme', theme);
        }
        
        this.storage.setTheme(theme);
    }

    bindEvents() {
        // Navigation
        document.getElementById('add-entry-btn').addEventListener('click', () => this.showAddEntryModal());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettingsModal());

        // Welcome form
        document.getElementById('start-btn').addEventListener('click', () => this.handleWelcomeSubmit());
        document.getElementById('car-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleWelcomeSubmit();
        });

        // Add entry form
        document.getElementById('add-entry-form').addEventListener('submit', (e) => this.handleAddEntry(e));

        // Settings
        document.getElementById('update-car-name').addEventListener('click', () => this.updateCarName());
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.applyTheme(e.target.value));
        });

        // Export/Import
        document.getElementById('export-data-btn').addEventListener('click', () => this.exportData());
        document.getElementById('export-settings-data-btn').addEventListener('click', () => this.exportData());
        document.getElementById('export-pdf-btn').addEventListener('click', () => this.exportToPDF());
        document.getElementById('import-data-btn').addEventListener('click', () => this.importData());
        document.getElementById('import-file').addEventListener('change', (e) => this.handleFileImport(e));
        document.getElementById('clear-data-btn').addEventListener('click', () => this.showClearDataConfirmation());

        // Search and filter
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('filter-type').addEventListener('change', (e) => this.handleFilter(e.target.value));

        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
        // Language change
        document.querySelectorAll('input[name="language"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.applyLanguage(e.target.value));
        });


        // Confirmation modal
        document.getElementById('confirmation-confirm').addEventListener('click', () => this.executeConfirmationAction());
        document.getElementById('confirmation-cancel').addEventListener('click', () => this.closeModal('confirmation-modal'));

        // Today's date as default
        document.getElementById('entry-date').valueAsDate = new Date();

        // System theme change detection
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.storage.getTheme() === 'system') {
                this.applyTheme('system');
            }
        });
    }

    showAddEntryModal() {
        this.showModal('add-entry-modal');
    }

    showSettingsModal() {
        const carNameInput = document.getElementById('settings-car-name');
        carNameInput.value = this.storage.getCarName();
        this.showModal('settings-modal');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
    }

    // closeModal(modalId) {
    //     const modal = document.getElementById(modalId);
    //     modal.classList.remove('show');
        
    //     // Reset forms
    //     if (modalId === 'add-entry-modal') {
    //         document.getElementById('add-entry-form').reset();
    //         document.getElementById('entry-date').valueAsDate = new Date();
    //     }
    // }
closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    
    // Reset forms
    if (modalId === 'add-entry-modal') {
        document.getElementById('add-entry-form').reset();
        document.getElementById('entry-date').valueAsDate = new Date();
        // Clear edit ID if it exists
        delete document.getElementById('add-entry-form').dataset.editId;
        // Reset form title
        document.querySelector('#add-entry-modal h2').textContent = 'Add Maintenance Entry';
    }
}
    handleWelcomeSubmit() {
        const carNameInput = document.getElementById('car-name-input');
        const carName = carNameInput.value.trim();
        
        if (!carName) {
            carNameInput.focus();
            return;
        }
        
        this.storage.setCarName(carName);
        this.storage.setFirstTimeComplete();
        
        // Update nav title
        document.getElementById('nav-car-name').textContent = carName;
        
        // Show main app
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        this.updateStatistics();
        this.renderMaintenanceLogs();
    }

    // handleAddEntry(e) {
    //     e.preventDefault();
        
    //     const formData = new FormData(e.target);
    //     const entry = {
    //         type: document.getElementById('entry-type').value,
    //         date: document.getElementById('entry-date').value,
    //         description: document.getElementById('entry-description').value,
    //         notes: document.getElementById('entry-notes').value,
    //         mileage: document.getElementById('entry-mileage').value || null,
    //         cost: document.getElementById('entry-cost').value || '0',
    //         nextDue: document.getElementById('entry-next-due').value || null
    //     };

    //     this.storage.addMaintenanceEntry(entry);
    //     this.closeModal('add-entry-modal');
    //     this.updateStatistics();
    //     this.renderMaintenanceLogs();
    //     this.showNotification('Maintenance entry added successfully!', 'success');
    // }
handleAddEntry(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const entry = {
        type: document.getElementById('entry-type').value,
        date: document.getElementById('entry-date').value,
        description: document.getElementById('entry-description').value,
        notes: document.getElementById('entry-notes').value,
        mileage: document.getElementById('entry-mileage').value || null,
        cost: document.getElementById('entry-cost').value || '0',
        nextDue: document.getElementById('entry-next-due').value || null
    };

    // Check if we're editing an existing entry
    const editId = e.target.dataset.editId;
    if (editId) {
        // Update existing entry
        this.storage.updateMaintenanceEntry(editId, entry);
        this.showNotification('Maintenance entry updated successfully!', 'success');
        delete e.target.dataset.editId; // Clear the edit ID
    } else {
        // Add new entry
        this.storage.addMaintenanceEntry(entry);
        this.showNotification('Maintenance entry added successfully!', 'success');
    }

    this.closeModal('add-entry-modal');
    this.updateStatistics();
    this.renderMaintenanceLogs();
}
    updateCarName() {
        const newName = document.getElementById('settings-car-name').value.trim();
        if (newName) {
            this.storage.setCarName(newName);
            document.getElementById('nav-car-name').textContent = newName;
            this.showNotification('Car name updated successfully!', 'success');
        }
    }

    updateStatistics() {
        const stats = this.storage.getStatistics();
        document.getElementById('total-entries').textContent = stats.totalEntries;
        document.getElementById('total-cost').textContent = `$${stats.totalCost}`;
        document.getElementById('last-service').textContent = stats.lastService;
    }

    renderMaintenanceLogs(logs = null) {
        const container = document.getElementById('maintenance-logs');
        const logsToRender = logs || this.storage.getMaintenanceLogs();
        
        if (logsToRender.length === 0) {
            container.innerHTML = `
                <div class="no-logs">
                    <i class="fas fa-tools"></i>
                    <h3>No maintenance records yet</h3>
                    <p>Start by adding your first maintenance entry</p>
                    <br>
                    <button class="btn btn-primary" onclick="uiManager.showAddEntryModal()">
                        <i class="fas fa-plus"></i>
                        Add First Entry
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = logsToRender.map(log => this.createMaintenanceEntryHTML(log)).join('');
    }

    createMaintenanceEntryHTML(log) {
        const icon = this.storage.getMaintenanceTypeIcon(log.type);
        const typeName = this.storage.getMaintenanceTypeDisplayName(log.type);
        const formattedDate = this.storage.formatDate(log.date);
        const mileageDisplay = log.mileage ? `${parseInt(log.mileage).toLocaleString()} miles` : '';
        const costDisplay = log.cost && parseFloat(log.cost) > 0 ? `$${parseFloat(log.cost).toFixed(2)}` : '';
        
        return `
            <div class="maintenance-entry" data-entry-id="${log.id}">
                <div class="entry-icon ${log.type}">
                    <i class="${icon}"></i>
                </div>
                <div class="entry-content">
                    <div class="entry-header">
                        <div class="entry-title">${typeName}</div>
                        <div class="entry-date">${formattedDate}</div>
                    </div>
                    <div class="entry-description">${log.description}</div>
                    ${log.notes ? `<div class="entry-notes">${log.notes}</div>` : ''}
                    <div class="entry-meta">
                        ${mileageDisplay ? `<span><i class="fas fa-tachometer-alt"></i> ${mileageDisplay}</span>` : ''}
                        ${costDisplay ? `<span><i class="fas fa-dollar-sign"></i> ${costDisplay}</span>` : ''}
                        ${log.nextDue ? `<span><i class="fas fa-calendar-check"></i> Next: ${this.storage.formatDate(log.nextDue)}</span>` : ''}
                    </div>
                    <div class="entry-actions">
                        <button class="btn btn-outline btn-sm" onclick="uiManager.editEntry('${log.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="uiManager.deleteEntry('${log.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    handleSearch(searchTerm) {
        const filterType = document.getElementById('filter-type').value;
        const filteredLogs = this.storage.searchMaintenanceLogs(searchTerm, filterType);
        this.renderMaintenanceLogs(filteredLogs);
    }

    handleFilter(filterType) {
        const searchTerm = document.getElementById('search-input').value;
        const filteredLogs = this.storage.searchMaintenanceLogs(searchTerm, filterType);
        this.renderMaintenanceLogs(filteredLogs);
    }

    // editEntry(id) {
    //     const logs = this.storage.getMaintenanceLogs();
    //     const entry = logs.find(log => log.id === id);
    //     if (entry) {
    //         // Populate form with existing data
    //         document.getElementById('entry-type').value = entry.type;
    //         document.getElementById('entry-date').value = entry.date;
    //         document.getElementById('entry-description').value = entry.description;
    //         document.getElementById('entry-notes').value = entry.notes || '';
    //         document.getElementById('entry-mileage').value = entry.mileage || '';
    //         document.getElementById('entry-cost').value = entry.cost || '';
    //         document.getElementById('entry-next-due').value = entry.nextDue || '';
            
    //         // Store the ID for updating
    //         document.getElementById('add-entry-form').dataset.editId = id;
            
    //         // Change form title
    //         document.querySelector('#add-entry-modal h2').textContent = 'Edit Maintenance Entry';
            
    //         this.showModal('add-entry-modal');
    //     }
    // }
editEntry(id) {
    const logs = this.storage.getMaintenanceLogs();
    const entry = logs.find(log => log.id === id);
    if (entry) {
        // Populate form with existing data
        document.getElementById('entry-type').value = entry.type;
        document.getElementById('entry-date').value = entry.date;
        document.getElementById('entry-description').value = entry.description;
        document.getElementById('entry-notes').value = entry.notes || '';
        document.getElementById('entry-mileage').value = entry.mileage || '';
        document.getElementById('entry-cost').value = entry.cost || '';
        document.getElementById('entry-next-due').value = entry.nextDue || '';
        
        // Store the ID for updating
        document.getElementById('add-entry-form').dataset.editId = id;
        
        // Change form title
        document.querySelector('#add-entry-modal h2').textContent = 'Edit Maintenance Entry';
        
        this.showModal('add-entry-modal');
    }
}
    deleteEntry(id) {
        this.showConfirmation(
            'Delete Entry',
            'Are you sure you want to delete this maintenance entry? This action cannot be undone.',
            () => {
                this.storage.deleteMaintenanceEntry(id);
                this.updateStatistics();
                this.renderMaintenanceLogs();
                this.showNotification('Entry deleted successfully!', 'success');
            }
        );
    }

    // exportData() {
    //     const data = this.storage.exportData();
    //     const carName = this.storage.getCarName().replace(/[^a-z0-9]/gi, '_').toLowerCase();
    //     const timestamp = new Date().toISOString().split('T')[0];
    //     const filename = `${carName}_maintenance_${timestamp}.car`;
        
    //     this.downloadFile(data, filename, 'application/json');
    //     this.showNotification('Data exported successfully!', 'success');
    // }
exportData() {
    const data = this.storage.exportData();
    const carName = this.storage.getCarName().replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Force .car extension by creating a blob with the correct type
    const blob = new Blob([data], { type: 'application/vnd.carcare.data' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${carName}_maintenance_${timestamp}.car`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    this.showNotification('Data exported successfully!', 'success');
}
importData() {
    // Create file input dynamically
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.car,.json';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', (e) => {
        this.handleFileImport(e);
        document.body.removeChild(fileInput);
    });
    
    document.body.appendChild(fileInput);
    fileInput.click();
}

handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check for valid extensions
    const validExtensions = ['.car', '.json'];
    const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
        this.showNotification('Please select a valid file (.car or .json)', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const result = this.storage.importData(e.target.result);
            if (result.success) {
                this.showNotification(result.message, 'success');
                this.updateStatistics();
                this.renderMaintenanceLogs();
                this.closeModal('settings-modal');
                // Update car name in nav
                document.getElementById('nav-car-name').textContent = this.storage.getCarName();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Failed to import file: ' + error.message, 'error');
        }
    };
    reader.onerror = () => {
        this.showNotification('Error reading file', 'error');
    };
    reader.readAsText(file);
}
    // importData() {
    //     document.getElementById('import-file').click();
    // }

    // handleFileImport(e) {
    //     const file = e.target.files[0];
    //     if (!file) return;
        
    //     if (!file.name.endsWith('.car')) {
    //         this.showNotification('Please select a valid .car file', 'error');
    //         return;
    //     }
        
    //     const reader = new FileReader();
    //     reader.onload = (e) => {
    //         const result = this.storage.importData(e.target.result);
    //         if (result.success) {
    //             this.showNotification(result.message, 'success');
    //             this.updateStatistics();
    //             this.renderMaintenanceLogs();
    //             this.closeModal('settings-modal');
    //             // Update car name in nav
    //             document.getElementById('nav-car-name').textContent = this.storage.getCarName();
    //         } else {
    //             this.showNotification(result.message, 'error');
    //         }
    //     };
    //     reader.readAsText(file);
        
    //     // Clear the input
    //     e.target.value = '';
    // }

    exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const logs = this.storage.getMaintenanceLogs();
        const carName = this.storage.getCarName();
        
        // Title
        doc.setFontSize(20);
        doc.text(`${carName} - Maintenance Report`, 20, 20);
        
        // Date
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
        
        // Statistics
        const stats = this.storage.getStatistics();
        doc.text(`Total Entries: ${stats.totalEntries}`, 20, 45);
        doc.text(`Total Cost: $${stats.totalCost}`, 20, 55);
        doc.text(`Last Service: ${stats.lastService}`, 20, 65);
        
        // Logs
        let yPosition = 80;
        doc.setFontSize(14);
        doc.text('Maintenance History:', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        logs.forEach((log, index) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            const typeName = this.storage.getMaintenanceTypeDisplayName(log.type);
            const formattedDate = this.storage.formatDate(log.date);
            const cost = log.cost && parseFloat(log.cost) > 0 ? ` - $${parseFloat(log.cost).toFixed(2)}` : '';
            const mileage = log.mileage ? ` - ${parseInt(log.mileage).toLocaleString()} miles` : '';
            
            doc.text(`${index + 1}. ${typeName} (${formattedDate})${cost}${mileage}`, 25, yPosition);
            yPosition += 8;
            
            if (log.description) {
                doc.text(`   ${log.description}`, 25, yPosition);
                yPosition += 6;
            }
            
            if (log.notes) {
                const notes = log.notes.length > 80 ? log.notes.substring(0, 80) + '...' : log.notes;
                doc.text(`   Notes: ${notes}`, 25, yPosition);
                yPosition += 6;
            }
            
            yPosition += 5; // Space between entries
        });
        
        // Save
        const filename = `${carName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_maintenance_report.pdf`;
        doc.save(filename);
        
        this.showNotification('PDF exported successfully!', 'success');
    }

    showClearDataConfirmation() {
        this.showConfirmation(
            'Clear All Data',
            'This will permanently delete all maintenance records and settings. This action cannot be undone.',
            () => {
                this.storage.clearAllData();
                // Reload the page to reset everything
                window.location.reload();
            }
        );
    }

    showConfirmation(title, message, onConfirm) {
        document.getElementById('confirmation-title').textContent = title;
        document.getElementById('confirmation-message').textContent = message;
        this.confirmationCallback = onConfirm;
        this.showModal('confirmation-modal');
    }

    executeConfirmationAction() {
        if (this.confirmationCallback) {
            this.confirmationCallback();
            this.confirmationCallback = null;
        }
        this.closeModal('confirmation-modal');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
// Helper method to force file download with specific extension
downloadFileWithExtension(content, filename, extension, contentType = 'application/octet-stream') {
    // Ensure the extension is included
    if (!filename.endsWith(extension)) {
        filename = `${filename}${extension}`;
    }
    
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Updated exportData using the helper
exportData() {
    const data = this.storage.exportData();
    const carName = this.storage.getCarName().replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${carName}_maintenance_${timestamp}`;
    
    this.downloadFileWithExtension(data, filename, '.car', 'application/vnd.carcare.data');
    this.showNotification('Data exported successfully!', 'success');
}
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-size: 0.875rem;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Make closeModal and showAddEntryModal globally accessible
window.closeModal = (modalId) => {
    if (window.uiManager) {
        window.uiManager.closeModal(modalId);
    }
};

window.showAddEntryModal = () => {
    if (window.uiManager) {
        window.uiManager.showAddEntryModal();
    }
};












// class UIManager {
//     constructor(storageManager) {
//         this.storage = storageManager;
//         this.currentView = 'dashboard';
//         this.currentLang = this.storage.getLanguage();
//         this.init();
//     }

//     init() {
//         this.initializeTheme();
//         this.initializeLanguage();
//         this.bindEvents();
//         this.updateStatistics();
//         this.renderMaintenanceLogs();
//     }

//     initializeLanguage() {
//         const savedLang = this.storage.getLanguage();
//         this.applyLanguage(savedLang);
        
//         // Set radio button
//         const langRadio = document.querySelector(`input[name="language"][value="${savedLang}"]`);
//         if (langRadio) {
//             langRadio.checked = true;
//         }
//     }

//     applyLanguage(lang) {
//         this.currentLang = lang;
//         this.storage.setLanguage(lang);
        
//         const translations = getTranslations(lang);
//         this.updateUIText(translations);
        
//         // Set document direction
//         document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
//         document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
//     }

//     updateUIText(translations) {
        
//         // Update all UI elements with translations
//         document.getElementById('nav-car-name').textContent = translations.appTitle;
//         document.querySelector('.welcome-container h1').textContent = translations.welcomeTitle;
//         document.querySelector('.welcome-container p').textContent = translations.welcomeSubtitle;
//         document.getElementById('car-name-input').placeholder = translations.carNamePlaceholder;
//         document.getElementById('start-btn').innerHTML = `<i class="fas fa-arrow-right"></i> ${translations.getStarted}`;
//         document.getElementById('add-entry-btn').innerHTML = `<i class="fas fa-plus"></i> ${translations.addEntry}`;
//         document.getElementById('settings-btn').innerHTML = `<i class="fas fa-cog"></i> ${translations.settings}`;
//         document.querySelector('.stat-content p:nth-child(1)').textContent = translations.totalEntries;
//         document.querySelector('.stat-content p:nth-child(2)').textContent = translations.totalCost;
//         document.querySelector('.stat-content p:nth-child(3)').textContent = translations.lastService;
//         document.getElementById('search-input').placeholder = translations.searchPlaceholder;
//         document.querySelector('#filter-type option[value=""]').textContent = translations.allCategories;
//         document.querySelector('.logs-header h2').textContent = translations.maintenanceHistory;
//         document.getElementById('export-pdf-btn').innerHTML = `<i class="fas fa-file-pdf"></i> ${translations.exportPDF}`;
//         document.getElementById('export-data-btn').innerHTML = `<i class="fas fa-download"></i> ${translations.exportData}`;
//         document.querySelector('.no-logs h3').textContent = translations.noRecords;
//         document.querySelector('.no-logs button').innerHTML = `<i class="fas fa-plus"></i> ${translations.addFirstEntry}`;
//         // Add all other elements that need translation...
//     }
// updateUIText(translations) {
//     // Safe element access with null checks
//     const safeSetText = (id, text) => {
//         const el = document.getElementById(id);
//         if (el) el.textContent = text;
//     };

//     safeSetText('nav-car-name', translations.appTitle);
//     safeSetText('car-name-input', translations.carNamePlaceholder);
//     // Add all other text updates here...
// }
//     initializeTheme() {
//         const savedTheme = this.storage.getTheme();
//         this.applyTheme(savedTheme);
        
//         // Set radio button
//         const themeRadio = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
//         if (themeRadio) {
//             themeRadio.checked = true;
//         }
//     }

//     applyTheme(theme) {
//         const html = document.documentElement;
        
//         if (theme === 'system') {
//             const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//             html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
//         } else {
//             html.setAttribute('data-theme', theme);
//         }
        
//         this.storage.setTheme(theme);
//     }

//     bindEvents() {
//         // Navigation
//         document.getElementById('add-entry-btn').addEventListener('click', () => this.showAddEntryModal());
//         document.getElementById('settings-btn').addEventListener('click', () => this.showSettingsModal());

//         // Welcome form
//         document.getElementById('start-btn').addEventListener('click', () => this.handleWelcomeSubmit());
//         document.getElementById('car-name-input').addEventListener('keypress', (e) => {
//             if (e.key === 'Enter') this.handleWelcomeSubmit();
//         });

//         // Add entry form
//         document.getElementById('add-entry-form').addEventListener('submit', (e) => this.handleAddEntry(e));

//         // Settings
//         document.getElementById('update-car-name').addEventListener('click', () => this.updateCarName());
//         document.querySelectorAll('input[name="theme"]').forEach(radio => {
//             radio.addEventListener('change', (e) => this.applyTheme(e.target.value));
//         });

//         // Export/Import
//         document.getElementById('export-data-btn').addEventListener('click', () => this.exportData());
//         document.getElementById('export-settings-data-btn').addEventListener('click', () => this.exportData());
//         document.getElementById('export-pdf-btn').addEventListener('click', () => this.exportToPDF());
//         document.getElementById('import-data-btn').addEventListener('click', () => this.importData());
//         document.getElementById('import-file').addEventListener('change', (e) => this.handleFileImport(e));
//         document.getElementById('clear-data-btn').addEventListener('click', () => this.showClearDataConfirmation());

//         // Search and filter
//         document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e.target.value));
//         document.getElementById('filter-type').addEventListener('change', (e) => this.handleFilter(e.target.value));

//         // Modal close events
//         document.addEventListener('click', (e) => {
//             if (e.target.classList.contains('modal')) {
//                 this.closeModal(e.target.id);
//             }
//         });

//         // Language change
//         document.querySelectorAll('input[name="language"]').forEach(radio => {
//             radio.addEventListener('change', (e) => this.applyLanguage(e.target.value));
//         });

//         // Confirmation modal
//         document.getElementById('confirmation-confirm').addEventListener('click', () => this.executeConfirmationAction());
//         document.getElementById('confirmation-cancel').addEventListener('click', () => this.closeModal('confirmation-modal'));

//         // Today's date as default
//         document.getElementById('entry-date').valueAsDate = new Date();

//         // System theme change detection
//         window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
//             if (this.storage.getTheme() === 'system') {
//                 this.applyTheme('system');
//             }
//         });
//     }

//     showAddEntryModal() {
//         this.showModal('add-entry-modal');
//     }

//     showSettingsModal() {
//         const carNameInput = document.getElementById('settings-car-name');
//         carNameInput.value = this.storage.getCarName();
//         this.showModal('settings-modal');
//     }

//     showModal(modalId) {
//         const modal = document.getElementById(modalId);
//         modal.classList.add('show');
//     }

//     closeModal(modalId) {
//         const modal = document.getElementById(modalId);
//         modal.classList.remove('show');
        
//         // Reset forms
//         if (modalId === 'add-entry-modal') {
//             document.getElementById('add-entry-form').reset();
//             document.getElementById('entry-date').valueAsDate = new Date();
//             // Clear edit ID if it exists
//             delete document.getElementById('add-entry-form').dataset.editId;
//             // Reset form title
//             document.querySelector('#add-entry-modal h2').textContent = 'Add Maintenance Entry';
//         }
//     }

//     handleWelcomeSubmit() {
//         const carNameInput = document.getElementById('car-name-input');
//         const carName = carNameInput.value.trim();
        
//         if (!carName) {
//             carNameInput.focus();
//             return;
//         }
        
//         this.storage.setCarName(carName);
//         this.storage.setFirstTimeComplete();
        
//         // Update nav title
//         document.getElementById('nav-car-name').textContent = carName;
        
//         // Show main app
//         document.getElementById('welcome-screen').classList.add('hidden');
//         document.getElementById('main-app').classList.remove('hidden');
        
//         this.updateStatistics();
//         this.renderMaintenanceLogs();
//     }

//     handleAddEntry(e) {
//         e.preventDefault();
        
//         const formData = new FormData(e.target);
//         const entry = {
//             type: document.getElementById('entry-type').value,
//             date: document.getElementById('entry-date').value,
//             description: document.getElementById('entry-description').value,
//             notes: document.getElementById('entry-notes').value,
//             mileage: document.getElementById('entry-mileage').value || null,
//             cost: document.getElementById('entry-cost').value || '0',
//             nextDue: document.getElementById('entry-next-due').value || null
//         };

//         // Check if we're editing an existing entry
//         const editId = e.target.dataset.editId;
//         if (editId) {
//             // Update existing entry
//             this.storage.updateMaintenanceEntry(editId, entry);
//             this.showNotification('Maintenance entry updated successfully!', 'success');
//             delete e.target.dataset.editId; // Clear the edit ID
//         } else {
//             // Add new entry
//             this.storage.addMaintenanceEntry(entry);
//             this.showNotification('Maintenance entry added successfully!', 'success');
//         }

//         this.closeModal('add-entry-modal');
//         this.updateStatistics();
//         this.renderMaintenanceLogs();
//     }

//     updateCarName() {
//         const newName = document.getElementById('settings-car-name').value.trim();
//         if (newName) {
//             this.storage.setCarName(newName);
//             document.getElementById('nav-car-name').textContent = newName;
//             this.showNotification('Car name updated successfully!', 'success');
//         }
//     }

//     updateStatistics() {
//         const stats = this.storage.getStatistics();
//         document.getElementById('total-entries').textContent = stats.totalEntries;
//         document.getElementById('total-cost').textContent = `$${stats.totalCost}`;
//         document.getElementById('last-service').textContent = stats.lastService;
//     }

//     renderMaintenanceLogs(logs = null) {
//         const container = document.getElementById('maintenance-logs');
//         const logsToRender = logs || this.storage.getMaintenanceLogs();
        
//         if (logsToRender.length === 0) {
//             container.innerHTML = `
//                 <div class="no-logs">
//                     <i class="fas fa-tools"></i>
//                     <h3>No maintenance records yet</h3>
//                     <p>Start by adding your first maintenance entry</p>
//                     <button class="btn btn-primary" onclick="uiManager.showAddEntryModal()">
//                         <i class="fas fa-plus"></i>
//                         Add First Entry
//                     </button>
//                 </div>
//             `;
//             return;
//         }

//         container.innerHTML = logsToRender.map(log => this.createMaintenanceEntryHTML(log)).join('');
//     }

//     createMaintenanceEntryHTML(log) {
//         const icon = this.storage.getMaintenanceTypeIcon(log.type);
//         const typeName = this.storage.getMaintenanceTypeDisplayName(log.type);
//         const formattedDate = this.storage.formatDate(log.date);
//         const mileageDisplay = log.mileage ? `${parseInt(log.mileage).toLocaleString()} miles` : '';
//         const costDisplay = log.cost && parseFloat(log.cost) > 0 ? `$${parseFloat(log.cost).toFixed(2)}` : '';
        
//         return `
//             <div class="maintenance-entry" data-entry-id="${log.id}">
//                 <div class="entry-icon ${log.type}">
//                     <i class="${icon}"></i>
//                 </div>
//                 <div class="entry-content">
//                     <div class="entry-header">
//                         <div class="entry-title">${typeName}</div>
//                         <div class="entry-date">${formattedDate}</div>
//                     </div>
//                     <div class="entry-description">${log.description}</div>
//                     ${log.notes ? `<div class="entry-notes">${log.notes}</div>` : ''}
//                     <div class="entry-meta">
//                         ${mileageDisplay ? `<span><i class="fas fa-tachometer-alt"></i> ${mileageDisplay}</span>` : ''}
//                         ${costDisplay ? `<span><i class="fas fa-dollar-sign"></i> ${costDisplay}</span>` : ''}
//                         ${log.nextDue ? `<span><i class="fas fa-calendar-check"></i> Next: ${this.storage.formatDate(log.nextDue)}</span>` : ''}
//                     </div>
//                     <div class="entry-actions">
//                         <button class="btn btn-outline btn-sm" onclick="uiManager.editEntry('${log.id}')">
//                             <i class="fas fa-edit"></i> Edit
//                         </button>
//                         <button class="btn btn-danger btn-sm" onclick="uiManager.deleteEntry('${log.id}')">
//                             <i class="fas fa-trash"></i> Delete
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }

//     handleSearch(searchTerm) {
//         const filterType = document.getElementById('filter-type').value;
//         const filteredLogs = this.storage.searchMaintenanceLogs(searchTerm, filterType);
//         this.renderMaintenanceLogs(filteredLogs);
//     }

//     handleFilter(filterType) {
//         const searchTerm = document.getElementById('search-input').value;
//         const filteredLogs = this.storage.searchMaintenanceLogs(searchTerm, filterType);
//         this.renderMaintenanceLogs(filteredLogs);
//     }

//     editEntry(id) {
//         const logs = this.storage.getMaintenanceLogs();
//         const entry = logs.find(log => log.id === id);
//         if (entry) {
//             // Populate form with existing data
//             document.getElementById('entry-type').value = entry.type;
//             document.getElementById('entry-date').value = entry.date;
//             document.getElementById('entry-description').value = entry.description;
//             document.getElementById('entry-notes').value = entry.notes || '';
//             document.getElementById('entry-mileage').value = entry.mileage || '';
//             document.getElementById('entry-cost').value = entry.cost || '';
//             document.getElementById('entry-next-due').value = entry.nextDue || '';
            
//             // Store the ID for updating
//             document.getElementById('add-entry-form').dataset.editId = id;
            
//             // Change form title
//             document.querySelector('#add-entry-modal h2').textContent = 'Edit Maintenance Entry';
            
//             this.showModal('add-entry-modal');
//         }
//     }

//     deleteEntry(id) {
//         this.showConfirmation(
//             'Delete Entry',
//             'Are you sure you want to delete this maintenance entry? This action cannot be undone.',
//             () => {
//                 this.storage.deleteMaintenanceEntry(id);
//                 this.updateStatistics();
//                 this.renderMaintenanceLogs();
//                 this.showNotification('Entry deleted successfully!', 'success');
//             }
//         );
//     }

//     exportData() {
//         const data = this.storage.exportData();
//         const carName = this.storage.getCarName().replace(/[^a-z0-9]/gi, '_').toLowerCase();
//         const timestamp = new Date().toISOString().split('T')[0];
//         const filename = `${carName}_maintenance_${timestamp}.car`;
        
//         this.downloadFile(data, filename, 'application/json');
//         this.showNotification('Data exported successfully!', 'success');
//     }

//     importData() {
//         document.getElementById('import-file').click();
//     }

//     handleFileImport(e) {
//         const file = e.target.files[0];
//         if (!file) return;
        
//         if (!file.name.endsWith('.car')) {
//             this.showNotification('Please select a valid .car file', 'error');
//             return;
//         }
        
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             const result = this.storage.importData(e.target.result);
//             if (result.success) {
//                 this.showNotification(result.message, 'success');
//                 this.updateStatistics();
//                 this.renderMaintenanceLogs();
//                 this.closeModal('settings-modal');
//                 // Update car name in nav
//                 document.getElementById('nav-car-name').textContent = this.storage.getCarName();
//             } else {
//                 this.showNotification(result.message, 'error');
//             }
//         };
//         reader.readAsText(file);
        
//         // Clear the input
//         e.target.value = '';
//     }

//     exportToPDF() {
//         const { jsPDF } = window.jspdf;
//         const doc = new jsPDF();
//         const logs = this.storage.getMaintenanceLogs();
//         const carName = this.storage.getCarName();
        
//         // Title
//         doc.setFontSize(20);
//         doc.text(`${carName} - Maintenance Report`, 20, 20);
        
//         // Date
//         doc.setFontSize(12);
//         doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
        
//         // Statistics
//         const stats = this.storage.getStatistics();
//         doc.text(`Total Entries: ${stats.totalEntries}`, 20, 45);
//         doc.text(`Total Cost: $${stats.totalCost}`, 20, 55);
//         doc.text(`Last Service: ${stats.lastService}`, 20, 65);
        
//         // Logs
//         let yPosition = 80;
//         doc.setFontSize(14);
//         doc.text('Maintenance History:', 20, yPosition);
//         yPosition += 10;
        
//         doc.setFontSize(10);
//         logs.forEach((log, index) => {
//             if (yPosition > 250) {
//                 doc.addPage();
//                 yPosition = 20;
//             }
            
//             const typeName = this.storage.getMaintenanceTypeDisplayName(log.type);
//             const formattedDate = this.storage.formatDate(log.date);
//             const cost = log.cost && parseFloat(log.cost) > 0 ? ` - $${parseFloat(log.cost).toFixed(2)}` : '';
//             const mileage = log.mileage ? ` - ${parseInt(log.mileage).toLocaleString()} miles` : '';
            
//             doc.text(`${index + 1}. ${typeName} (${formattedDate})${cost}${mileage}`, 25, yPosition);
//             yPosition += 8;
            
//             if (log.description) {
//                 doc.text(`   ${log.description}`, 25, yPosition);
//                 yPosition += 6;
//             }
            
//             if (log.notes) {
//                 const notes = log.notes.length > 80 ? log.notes.substring(0, 80) + '...' : log.notes;
//                 doc.text(`   Notes: ${notes}`, 25, yPosition);
//                 yPosition += 6;
//             }
            
//             yPosition += 5; // Space between entries
//         });
        
//         // Save
//         const filename = `${carName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_maintenance_report.pdf`;
//         doc.save(filename);
        
//         this.showNotification('PDF exported successfully!', 'success');
//     }

//     showClearDataConfirmation() {
//         this.showConfirmation(
//             'Clear All Data',
//             'This will permanently delete all maintenance records and settings. This action cannot be undone.',
//             () => {
//                 this.storage.clearAllData();
//                 // Reload the page to reset everything
//                 window.location.reload();
//             }
//         );
//     }

//     showConfirmation(title, message, onConfirm) {
//         document.getElementById('confirmation-title').textContent = title;
//         document.getElementById('confirmation-message').textContent = message;
//         this.confirmationCallback = onConfirm;
//         this.showModal('confirmation-modal');
//     }

//     executeConfirmationAction() {
//         if (this.confirmationCallback) {
//             this.confirmationCallback();
//             this.confirmationCallback = null;
//         }
//         this.closeModal('confirmation-modal');
//     }

//     downloadFile(content, filename, contentType) {
//         const blob = new Blob([content], { type: contentType });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.style.display = 'none';
//         a.href = url;
//         a.download = filename;
//         document.body.appendChild(a);
//         a.click();
//         window.URL.revokeObjectURL(url);
//         document.body.removeChild(a);
//     }

//     showNotification(message, type = 'info') {
//         // Create notification element
//         const notification = document.createElement('div');
//         notification.className = `notification notification-${type}`;
//         notification.style.cssText = `
//             position: fixed;
//             top: 20px;
//             right: 20px;
//             background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#3b82f6'};
//             color: white;
//             padding: 1rem 1.5rem;
//             border-radius: 8px;
//             box-shadow: var(--shadow-lg);
//             z-index: 10000;
//             transform: translateX(100%);
//             transition: transform 0.3s ease;
//             max-width: 300px;
//             font-size: 0.875rem;
//         `;
//         notification.textContent = message;
        
//         document.body.appendChild(notification);
        
//         // Animate in
//         requestAnimationFrame(() => {
//             notification.style.transform = 'translateX(0)';
//         });
        
//         // Auto remove after 3 seconds
//         setTimeout(() => {
//             notification.style.transform = 'translateX(100%)';
//             setTimeout(() => {
//                 if (notification.parentNode) {
//                     notification.parentNode.removeChild(notification);
//                 }
//             }, 300);
//         }, 3000);
//     }
// }

// // Make closeModal and showAddEntryModal globally accessible
// window.closeModal = (modalId) => {
//     if (window.uiManager) {
//         window.uiManager.closeModal(modalId);
//     }
// };

// window.showAddEntryModal = () => {
//     if (window.uiManager) {
//         window.uiManager.showAddEntryModal();
//     }
// };
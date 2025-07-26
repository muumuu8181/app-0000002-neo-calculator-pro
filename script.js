/**
 * Neo Calculator Pro v1.0
 * Professional Calculator Application
 */

class NeoCalculatorPro {
    constructor() {
        // Core calculation properties
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.history = [];
        this.maxHistoryItems = 50;
        
        // UI state
        this.currentTheme = 'neon';
        this.soundEnabled = true;
        this.hapticEnabled = true;
        this.decimalPlaces = 'auto';
        this.angleUnit = 'deg';
        
        // Session tracking
        this.sessionStartTime = Date.now();
        this.calculationsCount = 0;
        
        // Audio elements
        this.buttonSound = null;
        this.errorSound = null;
        
        // Advanced mode states
        this.historyExpanded = false;
        this.advancedExpanded = false;
        
        // Initialize the application
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupAudio();
        this.loadSettings();
        this.updateDisplay();
        this.updateMemoryIndicator();
        this.startSessionTimer();
        
        console.log('🧮 Neo Calculator Pro initialized successfully!');
    }
    
    setupEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.inputNumber(e.target.dataset.number);
                this.playSound('button');
                this.hapticFeedback();
            });
        });
        
        // Operator buttons
        document.querySelectorAll('[data-operator]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.inputOperator(e.target.dataset.operator);
                this.playSound('button');
                this.hapticFeedback();
            });
        });
        
        // Action buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.performAction(e.target.dataset.action);
                this.playSound('button');
                this.hapticFeedback();
            });
        });
        
        // Advanced function buttons
        document.querySelectorAll('[data-function]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.performFunction(e.target.dataset.function);
                this.playSound('button');
                this.hapticFeedback();
            });
        });
        
        // Theme selector
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });
        
        // History toggle
        document.getElementById('toggle-history').addEventListener('click', () => {
            this.toggleHistory();
        });
        
        // Clear history
        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearHistory();
        });
        
        // Advanced toggle
        document.getElementById('toggle-advanced').addEventListener('click', () => {
            this.toggleAdvanced();
        });
        
        // Settings
        document.getElementById('sound-effects').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('haptic-feedback').addEventListener('change', (e) => {
            this.hapticEnabled = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('decimal-places').addEventListener('change', (e) => {
            this.decimalPlaces = e.target.value;
            this.updateDisplay();
            this.saveSettings();
        });
        
        document.getElementById('angle-unit').addEventListener('change', (e) => {
            this.angleUnit = e.target.value;
            this.saveSettings();
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        // History item clicks
        document.getElementById('history-list').addEventListener('click', (e) => {
            const historyItem = e.target.closest('.history-item');
            if (historyItem) {
                const result = historyItem.querySelector('.history-result').textContent;
                this.currentValue = result;
                this.waitingForOperand = true;
                this.updateDisplay();
            }
        });
    }
    
    setupAudio() {
        this.buttonSound = document.getElementById('button-sound');
        this.errorSound = document.getElementById('error-sound');
    }
    
    // Core Calculation Methods
    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentValue = num;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        this.updateDisplay();
    }
    
    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentValue);
        
        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousValue || 0;
            const newValue = this.calculate(currentValue, inputValue, this.operator);
            
            if (newValue === null) {
                this.showError();
                return;
            }
            
            this.currentValue = String(newValue);
            this.previousValue = newValue;
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.updateDisplay();
        this.updateOperatorIndicator(nextOperator);
    }
    
    calculate(firstOperand, secondOperand, operator) {
        try {
            let result;
            
            switch (operator) {
                case '+':
                    result = firstOperand + secondOperand;
                    break;
                case '-':
                    result = firstOperand - secondOperand;
                    break;
                case '×':
                    result = firstOperand * secondOperand;
                    break;
                case '÷':
                    if (secondOperand === 0) {
                        throw new Error('Division by zero');
                    }
                    result = firstOperand / secondOperand;
                    break;
                default:
                    return null;
            }
            
            // Handle very large numbers
            if (!isFinite(result)) {
                throw new Error('Result too large');
            }
            
            return this.formatResult(result);
            
        } catch (error) {
            console.error('Calculation error:', error);
            return null;
        }
    }
    
    formatResult(value) {
        if (this.decimalPlaces === 'auto') {
            // Auto-format: remove unnecessary decimals, but keep precision
            const rounded = Math.round((value + Number.EPSILON) * 100000000) / 100000000;
            return parseFloat(rounded.toPrecision(12));
        } else {
            const places = parseInt(this.decimalPlaces);
            return parseFloat(value.toFixed(places));
        }
    }
    
    performAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'clear-all':
                this.clearAll();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'equals':
                this.performEquals();
                break;
            case 'memory-clear':
                this.memoryClear();
                break;
            case 'memory-recall':
                this.memoryRecall();
                break;
            case 'memory-add':
                this.memoryAdd();
                break;
            case 'memory-subtract':
                this.memorySubtract();
                break;
            case 'memory-store':
                this.memoryStore();
                break;
        }
    }
    
    performFunction(func) {
        const currentNum = parseFloat(this.currentValue);
        let result;
        
        try {
            switch (func) {
                case 'sqrt':
                    if (currentNum < 0) {
                        throw new Error('Square root of negative number');
                    }
                    result = Math.sqrt(currentNum);
                    break;
                case 'square':
                    result = currentNum * currentNum;
                    break;
                case 'power':
                    // Store for next operation
                    this.inputOperator('^');
                    return;
                case 'percent':
                    result = currentNum / 100;
                    break;
                case 'sin':
                    const sinAngle = this.angleUnit === 'deg' ? currentNum * Math.PI / 180 : currentNum;
                    result = Math.sin(sinAngle);
                    break;
                case 'cos':
                    const cosAngle = this.angleUnit === 'deg' ? currentNum * Math.PI / 180 : currentNum;
                    result = Math.cos(cosAngle);
                    break;
                case 'tan':
                    const tanAngle = this.angleUnit === 'deg' ? currentNum * Math.PI / 180 : currentNum;
                    result = Math.tan(tanAngle);
                    break;
                case 'log':
                    if (currentNum <= 0) {
                        throw new Error('Logarithm of non-positive number');
                    }
                    result = Math.log10(currentNum);
                    break;
                case 'ln':
                    if (currentNum <= 0) {
                        throw new Error('Natural logarithm of non-positive number');
                    }
                    result = Math.log(currentNum);
                    break;
                case 'pi':
                    result = Math.PI;
                    break;
                case 'e':
                    result = Math.E;
                    break;
                case 'factorial':
                    if (currentNum < 0 || !Number.isInteger(currentNum)) {
                        throw new Error('Factorial of non-integer or negative number');
                    }
                    result = this.factorial(currentNum);
                    break;
                default:
                    return;
            }
            
            if (!isFinite(result)) {
                throw new Error('Result too large');
            }
            
            this.currentValue = String(this.formatResult(result));
            this.waitingForOperand = true;
            this.updateDisplay();
            
        } catch (error) {
            console.error('Function error:', error);
            this.showError();
        }
    }
    
    factorial(n) {
        if (n === 0 || n === 1) return 1;
        if (n > 170) throw new Error('Factorial too large'); // JavaScript limit
        
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    performEquals() {
        const inputValue = parseFloat(this.currentValue);
        
        if (this.previousValue !== null && this.operator) {
            const newValue = this.calculate(this.previousValue, inputValue, this.operator);
            
            if (newValue === null) {
                this.showError();
                return;
            }
            
            // Add to history
            this.addToHistory(
                `${this.previousValue} ${this.operator} ${inputValue}`,
                newValue
            );
            
            this.currentValue = String(newValue);
            this.previousValue = null;
            this.operator = null;
            this.waitingForOperand = true;
            this.calculationsCount++;
            
            this.updateDisplay();
            this.updateOperatorIndicator('');
            this.updateCalculationsCount();
        }
    }
    
    clear() {
        this.currentValue = '0';
        this.updateDisplay();
    }
    
    clearAll() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.updateDisplay();
        this.updateOperatorIndicator('');
    }
    
    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }
    
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }
    
    // Memory Functions
    memoryClear() {
        this.memory = 0;
        this.updateMemoryIndicator();
    }
    
    memoryRecall() {
        this.currentValue = String(this.memory);
        this.waitingForOperand = true;
        this.updateDisplay();
    }
    
    memoryAdd() {
        this.memory += parseFloat(this.currentValue);
        this.updateMemoryIndicator();
    }
    
    memorySubtract() {
        this.memory -= parseFloat(this.currentValue);
        this.updateMemoryIndicator();
    }
    
    memoryStore() {
        this.memory = parseFloat(this.currentValue);
        this.updateMemoryIndicator();
    }
    
    // History Functions
    addToHistory(expression, result) {
        this.history.unshift({
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleTimeString()
        });
        
        // Limit history size
        if (this.history.length > this.maxHistoryItems) {
            this.history = this.history.slice(0, this.maxHistoryItems);
        }
        
        this.updateHistoryDisplay();
    }
    
    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
    }
    
    toggleHistory() {
        this.historyExpanded = !this.historyExpanded;
        const content = document.getElementById('history-content');
        const toggle = document.getElementById('toggle-history');
        
        if (this.historyExpanded) {
            content.classList.add('expanded');
            toggle.textContent = 'Hide History';
        } else {
            content.classList.remove('expanded');
            toggle.textContent = 'Show History';
        }
    }
    
    toggleAdvanced() {
        this.advancedExpanded = !this.advancedExpanded;
        const content = document.getElementById('advanced-content');
        const toggle = document.getElementById('toggle-advanced');
        
        if (this.advancedExpanded) {
            content.classList.add('expanded');
            toggle.textContent = 'Hide Advanced';
        } else {
            content.classList.remove('expanded');
            toggle.textContent = 'Show Advanced';
        }
    }
    
    // Display Updates
    updateDisplay() {
        const mainDisplay = document.getElementById('main-display');
        const historyDisplay = document.getElementById('history-display');
        
        // Format display value
        let displayValue = this.currentValue;
        
        // Add commas for large numbers
        if (!isNaN(displayValue) && displayValue.indexOf('.') === -1) {
            const num = parseInt(displayValue);
            if (Math.abs(num) >= 1000) {
                displayValue = num.toLocaleString();
            }
        }
        
        mainDisplay.textContent = displayValue;
        
        // Update history display
        let historyText = '';
        if (this.previousValue !== null && this.operator) {
            historyText = `${this.previousValue} ${this.operator}`;
        }
        historyDisplay.textContent = historyText;
    }
    
    updateOperatorIndicator(operator) {
        const indicator = document.getElementById('operation-indicator');
        indicator.textContent = operator ? `Operation: ${operator}` : '';
    }
    
    updateMemoryIndicator() {
        const indicator = document.getElementById('memory-indicator');
        if (this.memory !== 0) {
            indicator.classList.add('active');
            indicator.textContent = `M: ${this.formatResult(this.memory)}`;
        } else {
            indicator.classList.remove('active');
            indicator.textContent = 'M';
        }
    }
    
    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="no-history">No calculations yet</div>';
            return;
        }
        
        historyList.innerHTML = '';
        
        this.history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">${item.result}</div>
            `;
            historyList.appendChild(historyItem);
        });
    }
    
    updateCalculationsCount() {
        document.getElementById('calculations-count').textContent = `Calculations: ${this.calculationsCount}`;
    }
    
    // Theme Management
    changeTheme(theme) {
        this.currentTheme = theme;
        
        // Remove all theme classes
        document.body.className = '';
        
        // Add new theme class
        if (theme !== 'neon') {
            document.body.classList.add(`theme-${theme}`);
        }
        
        this.saveSettings();
    }
    
    // Error Handling
    showError() {
        const mainDisplay = document.getElementById('main-display');
        mainDisplay.textContent = 'Error';
        mainDisplay.classList.add('error');
        
        this.playSound('error');
        
        setTimeout(() => {
            mainDisplay.classList.remove('error');
            this.clearAll();
        }, 1500);
    }
    
    // Audio and Haptics
    playSound(type) {
        if (!this.soundEnabled) return;
        
        try {
            if (type === 'error' && this.errorSound) {
                this.errorSound.currentTime = 0;
                this.errorSound.play();
            } else if (this.buttonSound) {
                this.buttonSound.currentTime = 0;
                this.buttonSound.play();
            }
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }
    
    hapticFeedback() {
        if (!this.hapticEnabled) return;
        
        try {
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }
    
    // Keyboard Support
    handleKeyboard(e) {
        const key = e.key;
        
        // Prevent default for calculator keys
        if ('0123456789+-*/=.'.includes(key) || 
            ['Enter', 'Escape', 'Backspace', 'Delete'].includes(key)) {
            e.preventDefault();
        }
        
        // Number keys
        if ('0123456789'.includes(key)) {
            this.inputNumber(key);
            this.playSound('button');
        }
        
        // Operator keys
        switch (key) {
            case '+':
                this.inputOperator('+');
                break;
            case '-':
                this.inputOperator('-');
                break;
            case '*':
                this.inputOperator('×');
                break;
            case '/':
                this.inputOperator('÷');
                break;
            case '=':
            case 'Enter':
                this.performEquals();
                break;
            case '.':
                this.inputDecimal();
                break;
            case 'Escape':
                this.clearAll();
                break;
            case 'Backspace':
            case 'Delete':
                this.backspace();
                break;
        }
    }
    
    // Session Timer
    startSessionTimer() {
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 60000);
            document.getElementById('session-time').textContent = `Session: ${elapsed}m`;
        }, 60000);
    }
    
    // Settings Management
    saveSettings() {
        const settings = {
            theme: this.currentTheme,
            soundEnabled: this.soundEnabled,
            hapticEnabled: this.hapticEnabled,
            decimalPlaces: this.decimalPlaces,
            angleUnit: this.angleUnit
        };
        
        localStorage.setItem('neo-calculator-settings', JSON.stringify(settings));
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('neo-calculator-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                if (settings.theme) {
                    this.changeTheme(settings.theme);
                    document.getElementById('theme-select').value = settings.theme;
                }
                
                if (settings.hasOwnProperty('soundEnabled')) {
                    this.soundEnabled = settings.soundEnabled;
                    document.getElementById('sound-effects').checked = settings.soundEnabled;
                }
                
                if (settings.hasOwnProperty('hapticEnabled')) {
                    this.hapticEnabled = settings.hapticEnabled;
                    document.getElementById('haptic-feedback').checked = settings.hapticEnabled;
                }
                
                if (settings.decimalPlaces) {
                    this.decimalPlaces = settings.decimalPlaces;
                    document.getElementById('decimal-places').value = settings.decimalPlaces;
                }
                
                if (settings.angleUnit) {
                    this.angleUnit = settings.angleUnit;
                    document.getElementById('angle-unit').value = settings.angleUnit;
                }
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }
    
    // Utility Methods
    reset() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.updateDisplay();
        this.updateMemoryIndicator();
        this.updateOperatorIndicator('');
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new NeoCalculatorPro();
});

// Handle visibility changes for better performance
document.addEventListener('visibilitychange', () => {
    if (window.calculator) {
        if (document.hidden) {
            console.log('🧮 Calculator paused (tab hidden)');
        } else {
            console.log('🧮 Calculator resumed (tab visible)');
        }
    }
});

// Handle beforeunload to save state
window.addEventListener('beforeunload', () => {
    if (window.calculator) {
        window.calculator.saveSettings();
    }
});

console.log('🧮 Neo Calculator Pro script loaded successfully!');
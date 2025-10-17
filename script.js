class Calculator {
  constructor() {
    this.currentInput = '0';
    this.previousInput = '';
    this.operation = null;
    this.waitingForNewInput = false;
    this.pookieMode = false;
    this.soundEnabled = localStorage.getItem('calculatorSound') !== 'false';
    this.vibrationEnabled = localStorage.getItem('calculatorVibration') !== 'false';
    this.uiSoundsEnabled = localStorage.getItem('calculatorUISounds') || 'all';
    this.gesturesEnabled = localStorage.getItem('calculatorGestures') !== 'false';
    this.sounds = {
      default: {},
      pookie: {}
    };
    
    // Initialize history array and load from localStorage
    this.history = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
    
    // Initialize theme after DOM is ready
    setTimeout(() => {
      this.loadTheme();
      this.loadSounds();
      if (this.gesturesEnabled) {
        this.enableGestures();
      }
    }, 50);
  }
  
  loadSounds() {
    // Load default mode sounds
    this.loadSoundFiles('default', [
      'numbers.mp3',
      'operators.mp3',
      'functions.mp3',
      'memory.mp3',
      'equals.mp3',
      'clear.mp3',
      'gestures.mp3'
    ]);
    
    // Load pookie mode sounds (including activation sound)
    this.loadSoundFiles('pookie', [
      'numbers.mp3',
      'operators.mp3',
      'functions.mp3',
      'memory.mp3',
      'equals.mp3',
      'clear.mp3',
      'gestures.mp3',
      'pookie-activation.mp3'
    ]);
  }
  
  loadSoundFiles(mode, fileNames) {
    fileNames.forEach(fileName => {
      const audio = new Audio(`sounds/${mode}/${fileName}`);
      audio.preload = 'auto';
      this.sounds[mode][fileName] = audio;
      
      // Handle loading errors
      audio.addEventListener('error', () => {
        console.warn(`Failed to load sound: sounds/${mode}/${fileName}`);
      });
    });
  }
  
  playSound(soundType = 'button') {
    if (!this.soundEnabled) return;
    
    // Check UI sounds setting
    if (this.uiSoundsEnabled === 'none') return;
    
    const mode = this.pookieMode ? 'pookie' : 'default';
    const soundFile = `${soundType}.mp3`;
    
    if (this.sounds[mode] && this.sounds[mode][soundFile]) {
      const audio = this.sounds[mode][soundFile];
      
      // Reset audio to beginning for multiple rapid clicks
      audio.currentTime = 0;
      audio.play().catch(e => {
        console.warn('Audio playback failed:', e);
      });
    } else {
      // Fallback to simple beep if custom sound fails
      this.playFallbackBeep();
    }
  }
  
  enableGestures() {
    // Enable touch gestures like swipe to delete, long press for copy, etc.
    const calculator = document.querySelector('.calculator');
    let longPressTimer;
    
    calculator.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        longPressTimer = setTimeout(() => {
          // Long press detected - play gesture sound and trigger action
          this.playSound('gestures');
          console.log('Long press gesture triggered on:', e.target);
          // You can add custom gesture actions here
        }, 500);
      }
    });
    
    calculator.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
    });
    
    calculator.addEventListener('touchmove', (e) => {
      clearTimeout(longPressTimer);
    });
  }
  
  disableGestures() {
    // Disable touch gestures
    const calculator = document.querySelector('.calculator');
    calculator.replaceWith(calculator.cloneNode(true)); // Simple way to remove event listeners
  }
  
  playPookieActivationSound() {
    if (!this.soundEnabled) return;
    
    const activationSound = this.sounds.pookie['pookie-activation.mp3'];
    if (activationSound) {
      activationSound.currentTime = 0;
      activationSound.play().catch(e => {
        console.warn('Pookie activation sound playback failed:', e);
      });
    } else {
      // Fallback beep for activation
      this.playFallbackBeep();
    }
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('calculatorTheme') || 'pookie';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else if (savedTheme === 'pookie') {
      this.pookieMode = true;
      document.querySelector('.calculator').classList.add('pookie-mode');
    }
    // Light theme is default, no action needed
  }

  applyTheme(theme) {
    const body = document.body;
    const calculator = document.querySelector('.calculator');

    // Remove existing theme classes
    body.classList.remove('dark-mode');
    if (calculator) {
      calculator.classList.remove('pookie-mode');
      this.pookieMode = false;
    }

    // Apply new theme
    switch(theme) {
      case 'dark':
        body.classList.add('dark-mode');
        break;
      case 'pookie':
        if (calculator) {
          calculator.classList.add('pookie-mode');
          this.pookieMode = true;
        }
        break;
      default:
        // Light theme
        break;
    }

    localStorage.setItem('calculatorTheme', theme);
  }

  clear() {
    this.initialize();
  }

  appendNumber(number) {
    if (this.resetOnNextInput) {
      this.currentInput = '0';
      this.resetOnNextInput = false;
    }

    if (number === '.' && this.currentInput.includes('.')) return;
    
    if (this.currentInput === '0' && number !== '.') {
      this.currentInput = number;
    } else {
      this.currentInput += number;
    }
    
    // Remove leading zeros
    this.currentInput = this.currentInput.replace(/^0+(\d)/, '$1');
  }

  chooseOperation(operation) {
    if (this.currentInput === '') return;
    
    if (this.previousInput !== '') {
      this.compute();
    }
    
    this.operation = operation;
    this.previousInput = this.currentInput;
    this.resetOnNextInput = true;
  }

  compute() {
    // Handle case where there's no operation (just pressing = with a number)
    if (!this.operation) {
      if (this.pookieMode) {
        this.showPookieFlirt(this.currentInput);
      }
      return;
    }

    const prev = parseFloat(this.previousInput);
    const current = parseFloat(this.currentInput);
    
    let computation;
    if (isNaN(prev) || isNaN(current)) {
      // For invalid inputs, use 0 for flirty message
      computation = 0;
    } else {
      switch (this.operation) {
        case '+':
          computation = prev + current;
          break;
        case '−':
          computation = prev - current;
          break;
        case '×':
          computation = prev * current;
          break;
        case '÷':
          computation = prev / current;
          break;
        default:
          return;
      }
    }
    
    // Format number to handle floating point precision
    const result = parseFloat(computation.toFixed(10)).toString();
    
    // Save to history (only in default mode)
    if (!this.pookieMode) {
      this.saveToHistory(prev, current, this.operation, result);
      
      // Update display with result in default mode
      this.currentInput = result;
      
      // Capture operation before resetting
      const op = this.operation;
      this.operation = null;
      this.previousInput = '';
      this.resetOnNextInput = true;
      
      // Update history display
      this.updateHistoryDisplay(prev, current, op, result);
    } else {
      // In pookie mode, show flirty message instead of result
      this.showPookieFlirt(result);

      // Reset calculator state after showing flirty message (keep currentInput as flirty message)
      this.previousInput = '';
      this.operation = null;
      this.resetOnNextInput = true;
    }
  }
  
  saveToHistory(prev, current, operation, result) {
    const historyEntry = {
      id: Date.now(),
      calculation: `${prev} ${operation} ${current} = ${result}`,
      timestamp: new Date().toISOString()
    };
    
    // Add to beginning of history array
    this.history.unshift(historyEntry);
    
    // Keep only last 10 entries
    if (this.history.length > 10) {
      this.history = this.history.slice(0, 10);
    }
    
    // Save to localStorage
    localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
  }
  
  updateHistoryDisplay(prev, current, operation, result) {
    const historyElement = document.querySelector('.history');
    if (historyElement) {
      historyElement.textContent = `${prev} ${operation} ${current} =`;
    }
  }

  toggleSign() {
    this.currentInput = (parseFloat(this.currentInput) * -1).toString();
  }

  percentage() {
    this.currentInput = (parseFloat(this.currentInput) / 100).toString();
  }

  memoryAdd() {
    this.memory += parseFloat(this.currentInput);
  }

  memorySubtract() {
    this.memory -= parseFloat(this.currentInput);
  }

  memoryRecall() {
    this.currentInput = this.memory.toString();
  }

  togglePookieMode() {
    // Add camera shake effect
    document.body.classList.add('camera-shake');
    setTimeout(() => {
      document.body.classList.remove('camera-shake');
    }, 500);

    // Clear recent calculation from display
    this.currentInput = '0';
    this.previousInput = '';
    this.operation = null;
    this.resetOnNextInput = false;

    this.pookieMode = !this.pookieMode;
    const calculator = document.querySelector('.calculator');
    
    if (this.pookieMode) {
      // Apply the fixed dreamy palette first
      document.documentElement.style.setProperty('--pookie-bg', pookiePalette.background);
      document.documentElement.style.setProperty('--pookie-display-bg', pookiePalette.displayBg);
      document.documentElement.style.setProperty('--pookie-button-bg', pookiePalette.buttonBg);
      document.documentElement.style.setProperty('--pookie-button-hover', pookiePalette.buttonHover);
      document.documentElement.style.setProperty('--pookie-accent', pookiePalette.accent);
      document.documentElement.style.setProperty('--pookie-text', pookiePalette.text);
      
      // Remove any existing theme classes that might interfere
      document.body.classList.remove('dark-mode');
      
      // Apply pookie mode
      calculator.classList.add('pookie-mode');
      
      // Play pookie activation sound
      this.playPookieActivationSound();
      
      // Update theme in localStorage and settings menu
      localStorage.setItem('calculatorTheme', 'pookie');
      this.updateSettingsThemeSelection('pookie');
      
      console.log(`Pookie mode activated with ${pookiePalette.name} theme`);
    } else {
      calculator.classList.remove('pookie-mode');
      // Restore previous theme if not pookie
      const savedTheme = localStorage.getItem('calculatorTheme');
      if (savedTheme && savedTheme !== 'pookie') {
        if (savedTheme === 'dark') {
          document.body.classList.add('dark-mode');
        }
        this.updateSettingsThemeSelection(savedTheme);
      } else {
        this.updateSettingsThemeSelection('light');
      }
      console.log('Pookie mode deactivated');
    }
  }
  
  updateSettingsThemeSelection(theme) {
    // Update localStorage
    localStorage.setItem('calculatorTheme', theme);
    
    // If settings menu is open, update the dropdown
    const settingsOverlay = document.querySelector('.settings-overlay');
    if (settingsOverlay && settingsOverlay.classList.contains('active')) {
      const themeSelect = settingsOverlay.querySelector('.theme-select');
      if (themeSelect) {
        themeSelect.value = theme;
        // Trigger change event to update the UI
        themeSelect.dispatchEvent(new Event('change'));
      }
    }
  }

  showPookieFlirt(result) {
    try {
      // Try to load from file first
      const sections = this.loadPookieSections();

      // Classify the result using AI logic
      const category = this.classifyNumberAI(result, sections);
      const messages = sections[category] || [];

      if (messages.length > 0) {
        let randomMessage;
        
        // For numbers 1-10, select the message that matches the specific number
        if (category === 'Answers For Numbers 1-10 (Specific Puns)') {
          const num = parseInt(result);
          const matchingMessage = messages.find(msg => msg.startsWith(`(${num}):`));
          randomMessage = matchingMessage || messages[Math.floor(Math.random() * messages.length)];
        } else {
          randomMessage = messages[Math.floor(Math.random() * messages.length)];
        }
        
        const customizedMessage = randomMessage.replace(/\{answer\}/g, result);

        // Update display
        const display = document.querySelector('.current-input');
        if (display) {
          display.textContent = customizedMessage;
          
          // Dynamic font size based on message length
          const messageLength = customizedMessage.length;
          if (messageLength > 50) {
            display.style.fontSize = '20px';
          } else if (messageLength > 30) {
            display.style.fontSize = '24px';
          } else {
            display.style.fontSize = '28px';
          }
        }

        // Update history
        const historyElement = document.querySelector('.history');
        if (historyElement) {
          historyElement.textContent = customizedMessage;
          // Blur the history display in pookie mode to emphasize the flirty message
          if (this.pookieMode) {
            historyElement.style.filter = 'blur(2px)';
          }
        }

        // Set currentInput to the flirty message so updateDisplay handles it correctly
        this.currentInput = customizedMessage;

        return;
      }

      // If no messages in specific category, use fallback
      throw new Error('No messages for category');

    } catch (error) {
      console.error('Error in showPookieFlirt:', error);

      // Use hardcoded fallback
      const fallbackSections = this.getFallbackPookieSections();
      const category = this.classifyNumberAI(result, fallbackSections);
      const messages = fallbackSections[category] || fallbackSections['Answers For Any Number'] || [];

      if (messages.length > 0) {
        let randomMessage;
        
        // For numbers 1-10, select the message that matches the specific number
        if (category === 'Answers For Numbers 1-10 (Specific Puns)') {
          const num = parseInt(result);
          const matchingMessage = messages.find(msg => msg.startsWith(`(${num}):`));
          randomMessage = matchingMessage || messages[Math.floor(Math.random() * messages.length)];
        } else {
          randomMessage = messages[Math.floor(Math.random() * messages.length)];
        }
        
        const customizedMessage = randomMessage.replace(/\{answer\}/g, result);

        const display = document.querySelector('.current-input');
        if (display) {
          display.textContent = customizedMessage;
          
          // Dynamic font size based on message length
          const messageLength = customizedMessage.length;
          if (messageLength > 50) {
            display.style.fontSize = '20px';
          } else if (messageLength > 30) {
            display.style.fontSize = '24px';
          } else {
            display.style.fontSize = '28px';
          }
        }
      } else {
        // Ultimate fallback - always show a flirty message
        const display = document.querySelector('.current-input');
        if (display) {
          display.textContent = `You're my favorite calculation: ${result}! 💕`;
          
          // Dynamic font size for fallback
          const fallbackMessage = `You're my favorite calculation: ${result}! 💕`;
          const messageLength = fallbackMessage.length;
          if (messageLength > 50) {
            display.style.fontSize = '20px';
          } else if (messageLength > 30) {
            display.style.fontSize = '24px';
          } else {
            display.style.fontSize = '28px';
          }
        }
        customizedMessage = `You're my favorite calculation: ${result}! 💕`;
      }
      
      // Update history
      const historyElement = document.querySelector('.history');
      if (historyElement) {
        historyElement.textContent = customizedMessage;
        // Blur the history display in pookie mode to emphasize the flirty message
        if (this.pookieMode) {
          historyElement.style.filter = 'blur(2px)';
        }
      }
      
      // Set currentInput to the flirty message so updateDisplay handles it correctly
      this.currentInput = customizedMessage;
    }
  }

  loadPookieSections() {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'pookie_lines.txt', false); // Synchronous
      xhr.send();
      
      if (xhr.status === 200) {
        return this.parsePookieLines(xhr.responseText);
      } else {
        throw new Error('Failed to load file');
      }
    } catch (error) {
      console.error('Error loading pookie sections:', error);
      // Use fallback
      return this.getFallbackPookieSections();
    }
  }

  parsePookieLines(text) {
    const sections = {};
    const lines = text.split('\n');
    let currentSection = '';

    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('Answers For')) {
        currentSection = line;
        sections[currentSection] = [];
      } else if (currentSection && line && !line.startsWith('(') && !line.startsWith('//') && !line.startsWith('-')) {
        sections[currentSection].push(line);
      }
    });

    return sections;
  }

  classifyNumberAI(result, sections) {
    const num = parseFloat(result);

    // Handle invalid results - always show a flirty message
    if (isNaN(num)) {
      return 'Answers Just Plain Silly & Cute';
    }

    // Check for specific categories in order of specificity
    if (num === 0 && sections['Answers For the Number 0']) {
      return 'Answers For the Number 0';
    }

    if (num === 1 && sections['Answers For the Number 1']) {
      return 'Answers For the Number 1';
    }

    if (num < 0 && sections['Answers For Negative Numbers']) {
      return 'Answers For Negative Numbers';
    }

    if (num % 1 !== 0 && sections['Answers For Decimal Answers']) {
      return 'Answers For Decimal Answers';
    }

    if (num >= 1 && num <= 10 && sections['Answers For Numbers 1-10 (Specific Puns)']) {
      return 'Answers For Numbers 1-10 (Specific Puns)';
    }

    if (num > 1000 && sections['Answers For Large Numbers']) {
      return 'Answers For Large Numbers';
    }

    if (this.isPrime(num) && sections['Answers For Prime Numbers']) {
      return 'Answers For Prime Numbers';
    }

    if (this.isPerfectSquare(num) && sections['Answers For Perfect Squares (e.g., 4, 9, 16, 25)']) {
      return 'Answers For Perfect Squares (e.g., 4, 9, 16, 25)';
    }

    if (this.isDoubleNumber(num) && sections['Answers For Double Numbers (e.g., 11, 22, 33, 44)']) {
      return 'Answers For Double Numbers (e.g., 11, 22, 33, 44)';
    }

    if (num % 2 === 0 && sections['Answers For Even Numbers']) {
      return 'Answers For Even Numbers';
    }

    if (num % 2 !== 0 && sections['Answers For Odd Numbers']) {
      return 'Answers For Odd Numbers';
    }

    // Always fallback to a flirty category if nothing matches
    if (sections['Answers For Any Number']) {
      return 'Answers For Any Number';
    }

    // Ultimate fallback to silly & cute
    return 'Answers Just Plain Silly & Cute';
  }

  isPrime(num) {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  }

  isPerfectSquare(num) {
    if (num < 0) return false;
    const sqrt = Math.sqrt(num);
    return sqrt === Math.floor(sqrt);
  }

  isDoubleNumber(num) {
    const str = num.toString();
    if (str.length < 2) return false;
    return str[0] === str[1] && str.length === 2;
  }

  getFallbackPookieSections() {
    return {
      'Answers For Any Number': [
        "You + Me = {answer}ever.",
        "You have {answer}% of my heart. (The rest is yours too, silly).",
        "That's the number of reasons you're amazing. (I'm still counting).",
        "My heart does {answer} beats per minute just for you.",
        "Our future? I give it a {answer} out of 10.",
        "That's how many kisses I owe you.",
        "The answer is {answer}, but my love for you is immeasurable.",
        "You're more than {answer} to me.",
        "I'd rather be with you than have {answer} dollars.",
        "If I had {answer} wishes, I'd wish for you every time.",
        "You're the {answer}th reason I smile every day.",
        "My heart skips {answer} beats every time I see you.",
        "We've got {answer} reasons to stay together forever.",
        "You're the answer to my {answer} prayers.",
        "I love you {answer} times more than chocolate.",
        "You're {answer} times hotter than the sun.",
        "I'd walk {answer} miles just to see you.",
        "You're one in {answer}.",
        "I've fallen for you {answer} times and I'd do it again.",
        "You're the {answer}th wonder of my world.",
        "My love for you is {answer} light years long.",
        "You're the {answer}th note in my symphony of love.",
        "I'd spend {answer} lifetimes with you.",
        "You're the {answer}th piece of my heart.",
        "I've got {answer} reasons to kiss you right now.",
        "You're the {answer}th star in my sky."
      ],
      'Answers For the Number 0': [
        "Zero doubts, you're the one.",
        "My love for you? Zero conditions.",
        "The chance of me leaving? Zero.",
        "Zero reasons to ever let you go."
      ],
      'Answers For the Number 1': [
        "You're my number one. Always.",
        "The one and only person for me.",
        "One look from you and I'm done for.",
        "You are my one in a million."
      ],
      'Answers For Prime Numbers': [
        "Our love is prime; it can't be divided.",
        "You're one of a kind, like a prime number.",
        "This number is prime, just like our relationship goals."
      ],
      'Answers For Numbers 1-10 (Specific Puns)': [
        "(2): \"It takes two to tango, and I only want to tango with you.\"",
        "(3): \"Three little words: I. Love. You.\"",
        "(4): \"I'm falling for you, 4-real.\"",
        "(5): \"Give me 5... minutes more with you?\"",
        "(6): \"You're my 6, because you make me feel like a 10.\"",
        "(7): \"You're my lucky 7.\"",
        "(8): \"You're the one I 8-ly think about.\"",
        "(9): \"I'd choose you 9 times out of 10. (The 10th time I was distracted by how cute you are).\"",
        "(10): \"You're a perfect 10, and don't you forget it.\""
      ],
      'Answers For Even Numbers': [
        "Even numbers are lucky, just like me for having you.",
        "We're an even better team than I thought.",
        "My love for you is even and unconditional."
      ],
      'Answers For Odd Numbers': [
        "We're oddly perfect for each other.",
        "An odd number, just like my quirky love for you.",
        "It's odd how everything makes sense with you."
      ],
      'Answers For Perfect Squares (e.g., 4, 9, 16, 25)': [
        "Our love is a perfect square, no roots of doubt.",
        "You make everything perfect, squared.",
        "We fit together like a perfect square."
      ],
      'Answers For Double Numbers (e.g., 11, 22, 33, 44)': [
        "Look, a double number! We're twice as nice together.",
        "Double the number, double the love for you.",
        "We're a matching pair, just like this number."
      ],
      'Answers For Large Numbers': [
        "That's approximately how many neurons you short-circuit in my brain.",
        "A number as infinite as my crush on you.",
        "That's how many seconds I'd wait for you.",
        "My love for you is in the {answer} digits."
      ],
      'Answers For Negative Numbers': [
        "A negative result? That's how much I don't like being away from you.",
        "Below zero is how my heart would be without you.",
        "Negative? That's impossible, because my love for you is always positive."
      ],
      'Answers For Decimal Answers': [
        "A little decimal, just like the little space left in my heart before I met you.",
        "Not a whole number, but you make me feel whole.",
        "Our love isn't basic; it has depth, just like this decimal."
      ],
      'Answers Just Plain Silly & Cute': [
        "The answer is {answer}, but the real solution is cuddles.",
        "Error 404: Answer not found, too distracted by you.",
        "You're my favorite calculation! ",
        "Math was never this fun until I met you! ",
        "You're the reason I love math! "
      ]
    };
  }

  updateDisplay() {
    const display = document.querySelector('.current-input');
    if (display) {
      // In pookie mode, don't format as number if it's a flirty message
      if (this.pookieMode && (this.currentInput.includes('💕') || this.currentInput.includes('❤️') || this.currentInput.includes('✨') || this.currentInput.includes('{answer}'))) {
        display.textContent = this.currentInput;
      } else {
        // Format number with commas for default mode
        const num = parseFloat(this.currentInput);
        if (!isNaN(num)) {
          display.textContent = num.toLocaleString('en-US', {
            maximumFractionDigits: 8,
            useGrouping: true
          });
        } else {
          display.textContent = this.currentInput;
        }
      }
    }

    // Update AC to C when there's input
    const clearButton = document.querySelector('[data-action="clear"]');
    if (clearButton) {
      clearButton.textContent = (this.currentInput === '0' && !this.previousInput) ? 'AC' : 'C';
    }
  }

  handleButtonClick(button) {
    const action = button.dataset.action;
    const number = button.dataset.number;
    const operator = button.dataset.operator;

    // Play sound based on button type
    if (this.soundEnabled) {
      if (number) {
        this.playSound('numbers');
      } else if (operator && operator !== '=') {
        this.playSound('operators');
      } else if (operator === '=') {
        this.playSound('equals');
      } else if (action) {
        if (['memory-add', 'memory-subtract', 'memory-recall', 'memory-clear'].includes(action)) {
          this.playSound('memory');
        } else if (action === 'clear') {
          this.playSound('clear');
        } else {
          this.playSound('functions');
        }
      }
    }
    
    // Trigger vibration if enabled
    if (this.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    if (number) {
      this.appendNumber(number);
      this.updateDisplay();
    } else if (operator) {
      if (operator === '=') {
        this.compute();
        // Show flirty message in pookie mode (handled in compute method)
      } else {
        this.chooseOperation(operator);
      }
      this.updateDisplay();
    } else if (action) {
      if (action === 'clear') {
        if (button.textContent === 'C') {
          this.currentInput = '0';
          button.textContent = 'AC';
        } else {
          this.clear();
        }
      } else if (action === 'toggle') {
        this.toggleSign();
      } else if (action === 'percent') {
        this.percentage();
      } else if (action === 'memory-add') {
        this.memoryAdd();
      } else if (action === 'memory-subtract') {
        this.memorySubtract();
      } else if (action === 'memory-recall') {
        this.memoryRecall();
      } else if (action === 'memory-clear') {
        this.memoryClear();
      }
      this.updateDisplay();
    }
  }
  
  playSound(soundType = 'button') {
    if (!this.soundEnabled) return;
    
    // Check UI sounds setting
    if (this.uiSoundsEnabled === 'none') return;
    
    const mode = this.pookieMode ? 'pookie' : 'default';
    const soundFile = `${soundType}.mp3`;
    
    if (this.sounds[mode] && this.sounds[mode][soundFile]) {
      const audio = this.sounds[mode][soundFile];
      
      // Reset audio to beginning for multiple rapid clicks
      audio.currentTime = 0;
      audio.play().catch(e => {
        console.warn('Audio playback failed:', e);
      });
    } else {
      // Fallback to simple beep if custom sound fails
      this.playFallbackBeep();
    }
  }
}

// Fixed color palette for pookie mode (only light baby pink and white)
const pookiePalette = {
  name: 'dreamy',
  background: 'linear-gradient(135deg, #fce4ec 0%, #fce4ec 50%, #ffffff 100%)',
  displayBg: 'rgba(252, 228, 236, 0.9)',
  buttonBg: 'linear-gradient(135deg, #fce4ec, #f8bbd9)',
  buttonHover: 'linear-gradient(135deg, #f8bbd9, #fce4ec)',
  accent: '#e91e63',
  text: '#c2185b'
};

// Cloud PNG files for transition (place these in /images/clouds/ folder)
// You'll need to add these files:
// - cloud1.png
// - cloud2.png  
// - cloud3.png
// - cloud4.png
// - cloud5.png
// These should be transparent PNG images of white/light clouds

// Function to create button shattering transition
function shatterButtons() {
  console.log('Shattering buttons for transition');
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach((button, index) => {
    // Create 6-8 shattering pieces for each button
    const pieceCount = Math.floor(Math.random() * 3) + 6;
    
    for (let i = 0; i < pieceCount; i++) {
      const piece = document.createElement('div');
      piece.classList.add('shatter-piece');
      
      // Get button position and size
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Random position within button
      const angle = (Math.PI * 2 * i) / pieceCount;
      const distance = Math.random() * (Math.min(rect.width, rect.height) / 3);
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      piece.style.width = `${Math.random() * 15 + 8}px`;
      piece.style.height = `${Math.random() * 15 + 8}px`;
      
      // Random rotation
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      // Add to body
      document.body.appendChild(piece);
      
      // Animate pieces flying outward
      const delay = index * 100 + Math.random() * 200;
      const duration = 800 + Math.random() * 400;
      
      setTimeout(() => {
        const moveX = (Math.random() - 0.5) * 300;
        const moveY = (Math.random() - 0.5) * 300;
        const rotation = Math.random() * 720;
        
        piece.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        piece.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg) scale(0)`;
        piece.style.opacity = '0';
        
        setTimeout(() => piece.remove(), duration);
      }, delay);
    }
    
    // Hide original button after pieces start flying
    setTimeout(() => {
      button.style.opacity = '0';
      button.style.transform = 'scale(0)';
    }, index * 100 + 100);
  });
}

// Function to create particle effects
function createParticles(button, event) {
  console.log('Creating dreamy white stars for button:', button.textContent);
  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Function to trigger dreamy fade-in effect
  function triggerDreamyFadeIn() {
    console.log('Triggering dreamy fade-in effect');
    
    // Add dreamy overlay that fades in
    const calculator = document.querySelector('.calculator');
    const dreamyOverlay = document.createElement('div');
    dreamyOverlay.classList.add('dreamy-fade-overlay');
    calculator.appendChild(dreamyOverlay);
    
    // Remove overlay after animation
    setTimeout(() => {
      dreamyOverlay.remove();
    }, 1500);
  }

  // Create 8-12 dreamy white stars
  const particleCount = Math.floor(Math.random() * 5) + 8;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('dreamy-star');
    
    // Random dreamy position around the button
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 40;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    // Random size for variety
    const size = 6 + Math.random() * 10;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Add to body
    document.body.appendChild(particle);
    
    // Dreamy animation with random delay and duration
    const delay = Math.random() * 300;
    const duration = 1500 + Math.random() * 500;
    
    setTimeout(() => {
      const moveX = (Math.random() - 0.5) * 100;
      const moveY = (Math.random() - 0.5) * 100;
      particle.style.transform = `translate(${moveX}px, ${moveY}px) scale(0) rotate(${Math.random() * 720}deg)`;
      particle.style.opacity = '0';
      setTimeout(() => particle.remove(), duration);
    }, delay);
  }
}

// Function to show iOS-style notification
function showIOSNotification(message, className = 'ios-notification') {
  // Remove any existing notifications with the same class
  const existingNotifications = document.querySelectorAll(`.${className}`);
  existingNotifications.forEach(notif => notif.remove());
  
  const notification = document.createElement('div');
  notification.className = className;
  
  // Create content container for proper text layout with icon
  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.alignItems = 'center';
  content.style.justifyContent = 'center';
  content.style.gap = '12px';
  content.style.paddingLeft = '8px';
  content.textContent = message;
  notification.appendChild(content);
  
  // Ensure proper positioning and z-index
  notification.style.position = 'fixed';
  notification.style.left = '50%';
  notification.style.top = '20px';
  notification.style.transform = 'translateX(-50%) translateY(-140px)';
  notification.style.zIndex = '10000';
  
  document.body.appendChild(notification);
  
  // iOS-style animation sequence with ultra-smooth easing
  setTimeout(() => {
    // Ultra-smooth slide down with micro-bounce
    notification.style.transform = 'translateX(-50%) translateY(0) scale(0.94)';
    notification.style.opacity = '0.5';
    
    setTimeout(() => {
      // Settle with ultra-smooth micro-animation
      notification.style.transform = 'translateX(-50%) translateY(0) scale(1)';
      notification.style.opacity = '1';
    }, 400);
  }, 150);
  
  // Auto remove with ultra-smooth animation
  setTimeout(() => {
    // Smooth slide up with scale and opacity
    notification.style.transform = 'translateX(-50%) translateY(-140px) scale(0.94)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 1000);
  }, 5000);
}

// Initialize calculator globally
const calculator = new Calculator();

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Removed welcome notification
  // setTimeout(() => {
  //   showIOSNotification('Try the pookie mode 🌸', 'ios-notification-welcome');
  // }, 1500);
  
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
    button.addEventListener('click', (event) => {
      // Handle button click
      calculator.handleButtonClick(button);
    });
  });
  
  // Add corner button functionality
  const menuBtn = document.getElementById('menu-btn');
  const ribbonBtn = document.getElementById('ribbon-btn');
  
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      showIOSMenu();
    });
  }
  
  // Define functions first
  function showIOSMenu() {
    // Create iOS-style menu overlay
    const menuOverlay = document.createElement('div');
    menuOverlay.classList.add('ios-menu-overlay');
    
    const menuContainer = document.createElement('div');
    menuContainer.classList.add('ios-menu-container');
    
    // Add drag functionality
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let initialTransform = -260; // Initial position off-screen
    
    menuContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      currentX = initialTransform;
    });
    
    menuContainer.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const deltaX = e.touches[0].clientX - startX;
      currentX = Math.max(-260, Math.min(0, initialTransform + deltaX));
      menuContainer.style.transform = `translateX(${currentX}px)`;
    });
    
    menuContainer.addEventListener('touchend', () => {
      isDragging = false;
      if (currentX < -130) {
        // Close if dragged more than half
        closeIOSMenu();
      } else {
        // Snap back to open
        menuContainer.style.transform = 'translateX(0)';
      }
    });
    
    // Also add mouse events for desktop
    menuContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      currentX = initialTransform;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      currentX = Math.max(-260, Math.min(0, initialTransform + deltaX));
      menuContainer.style.transform = `translateX(${currentX}px)`;
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
      if (currentX < -130) {
        closeIOSMenu();
      } else {
        menuContainer.style.transform = 'translateX(0)';
      }
    });
    
    const menuOptions = [
      { text: 'Settings', action: 'settings' },
      { text: 'History', action: 'history' },
      { text: 'About', action: 'about' }
    ];
    
    menuOptions.forEach(option => {
      const menuItem = document.createElement('div');
      menuItem.classList.add('ios-menu-item');
      menuItem.textContent = option.text;
      menuItem.addEventListener('click', () => {
        handleMenuSelection(option.action);
        closeIOSMenu();
      });
      menuContainer.appendChild(menuItem);
    });
    
    menuOverlay.appendChild(menuContainer);
    document.body.appendChild(menuOverlay);
    
    // Set initial transform
    menuContainer.style.transform = `translateX(${initialTransform}px)`;
    
    // Animate in
    setTimeout(() => {
      menuOverlay.classList.add('active');
      menuContainer.style.transform = 'translateX(0)';
    }, 10);
  }
  
  function closeIOSMenu() {
    const menuOverlay = document.querySelector('.ios-menu-overlay');
    if (menuOverlay) {
      menuOverlay.classList.remove('active');
      setTimeout(() => {
        menuOverlay.remove();
      }, 300);
    }
  }
  
  function handleMenuSelection(action) {
    switch(action) {
      case 'settings':
        showSettingsMenu();
        break;
      case 'history':
        showHistory();
        break;
      case 'about':
        showPookieBox();
        break;
    }
  }
  
  async function showHistory() {
    try {
      // Load history lines and error messages from files
      const [historyLinesResponse, errorMessagesResponse] = await Promise.all([
        fetch('history_lines.txt'),
        fetch('error_messages.txt')
      ]);
      
      const historyLinesText = await historyLinesResponse.text();
      const errorMessagesText = await errorMessagesResponse.text();
      
      const historyLines = historyLinesText.split('\n').filter(line => line.trim() !== '');
      const errorMessages = errorMessagesText.split('\n').filter(line => line.trim() !== '');
      
      // Create history overlay
      const historyOverlay = document.createElement('div');
      historyOverlay.classList.add('history-overlay');
      
      const historyContainer = document.createElement('div');
      historyContainer.classList.add('history-container');
      
      // History header
      const historyHeader = document.createElement('div');
      historyHeader.classList.add('history-header');
      
      const historyTitle = document.createElement('h3');
      historyTitle.textContent = 'Calculation History';
      
      const historyCloseBtn = document.createElement('button');
      historyCloseBtn.classList.add('history-close');
      historyCloseBtn.textContent = '×';
      historyCloseBtn.addEventListener('click', () => {
        historyOverlay.classList.remove('active');
        setTimeout(() => historyOverlay.remove(), 300);
      });
      
      historyHeader.appendChild(historyTitle);
      historyHeader.appendChild(historyCloseBtn);
      
      // History items (show last 10 calculations)
      const historyItems = document.createElement('div');
      historyItems.classList.add('history-items');
      
      // Show up to 10 history items
      const itemsToShow = Math.min(calculator.history.length, 10);
      for (let i = 0; i < itemsToShow; i++) {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        
        // Get history line (cycle through available lines)
        const lineIndex = i % historyLines.length;
        const description = historyLines[lineIndex];
        
        historyItem.innerHTML = `
          <div class="history-calculation">${calculator.history[i].calculation}</div>
          <div class="history-description">${description}</div>
        `;
        
        // Add click event for iOS error
        historyItem.addEventListener('click', () => {
          const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
          showIOSError(randomError);
        });
        
        historyItems.appendChild(historyItem);
      }
      
      // If no history, show message
      if (itemsToShow === 0) {
        const noHistory = document.createElement('div');
        noHistory.classList.add('no-history');
        noHistory.textContent = 'No calculations yet! Start calculating to see your history here ✨';
        historyItems.appendChild(noHistory);
      }
      
      historyContainer.appendChild(historyHeader);
      historyContainer.appendChild(historyItems);
      historyOverlay.appendChild(historyContainer);
      document.body.appendChild(historyOverlay);
      
      // Animate in
      setTimeout(() => {
        historyOverlay.classList.add('active');
      }, 10);
      
      // Close on overlay click
      historyOverlay.addEventListener('click', (e) => {
        if (e.target === historyOverlay) {
          historyOverlay.classList.remove('active');
          setTimeout(() => historyOverlay.remove(), 300);
        }
      });
    } catch (error) {
      console.error('Error loading history data:', error);
      // Fallback to hardcoded arrays if files fail to load
      showHistoryFallback();
    }
  }
  
  function showHistoryFallback() {
    // Fallback function with hardcoded arrays
    const historyLines = [
      'Magical calculation completed!',
      'Numbers danced together perfectly',
      'Mathematical magic happened here',
      'Stars aligned for this result',
      'Pookie power activated',
      'Dreamy digits computed',
      'Calculation completed with love',
      'Numbers whispered their secret',
      'Mathematical poetry in motion',
      'Pookie mode enhanced result'
    ];
    
    const errorMessages = [
      'Oops! That calculation got lost in the clouds ☁️',
      'Hmm, that number seems to have floated away...',
      'Calculation vanished into thin air! ✨',
      'That result decided to take a vacation 🏖️',
      'Numbers are playing hide and seek! 🙈',
      'Calculation took a magical detour...',
      'That answer is hiding in the pookie realm',
      'Mathematical mystery unsolved! 🔮',
      'Calculation evaporated like morning dew',
      'Numbers went on a coffee break ☕'
    ];
    
    // Same logic as above but with hardcoded arrays
    const historyOverlay = document.createElement('div');
    historyOverlay.classList.add('history-overlay');
    
    const historyContainer = document.createElement('div');
    historyContainer.classList.add('history-container');
    
    const historyHeader = document.createElement('div');
    historyHeader.classList.add('history-header');
    
    const historyTitle = document.createElement('h3');
    historyTitle.textContent = 'Calculation History';
    
    const historyCloseBtn = document.createElement('button');
    historyCloseBtn.classList.add('history-close');
    historyCloseBtn.textContent = '×';
    historyCloseBtn.addEventListener('click', () => {
      historyOverlay.classList.remove('active');
      setTimeout(() => historyOverlay.remove(), 300);
    });
    
    historyHeader.appendChild(historyTitle);
    historyHeader.appendChild(historyCloseBtn);
    
    const historyItems = document.createElement('div');
    historyItems.classList.add('history-items');
    
    const itemsToShow = Math.min(calculator.history.length, 10);
    for (let i = 0; i < itemsToShow; i++) {
      const historyItem = document.createElement('div');
      historyItem.classList.add('history-item');
      
      const lineIndex = i % historyLines.length;
      const description = historyLines[lineIndex];
      
      historyItem.innerHTML = `
        <div class="history-calculation">${calculator.history[i].calculation}</div>
        <div class="history-description">${description}</div>
      `;
      
      historyItem.addEventListener('click', () => {
        const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        showIOSError(randomError);
      });
      
      historyItems.appendChild(historyItem);
    }
    
    if (itemsToShow === 0) {
      const noHistory = document.createElement('div');
      noHistory.classList.add('no-history');
      noHistory.textContent = 'No calculations yet! Start calculating to see your history here ✨';
      historyItems.appendChild(noHistory);
    }
    
    historyContainer.appendChild(historyHeader);
    historyContainer.appendChild(historyItems);
    historyOverlay.appendChild(historyContainer);
    document.body.appendChild(historyOverlay);
    
    setTimeout(() => {
      historyOverlay.classList.add('active');
    }, 10);
    
    historyOverlay.addEventListener('click', (e) => {
      if (e.target === historyOverlay) {
        historyOverlay.classList.remove('active');
        setTimeout(() => historyOverlay.remove(), 300);
      }
    });
  }
  
  function showIOSError(message) {
    // Create iOS-style error overlay
    const errorOverlay = document.createElement('div');
    errorOverlay.classList.add('ios-error-overlay');
    
    const errorContainer = document.createElement('div');
    errorContainer.classList.add('ios-error-container');
    
    const errorIcon = document.createElement('div');
    errorIcon.classList.add('ios-error-icon');
    errorIcon.innerHTML = '⚠️';
    
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('ios-error-message');
    errorMessage.textContent = message;
    
    const errorButton = document.createElement('button');
    errorButton.classList.add('ios-error-button');
    errorButton.textContent = 'OK';
    errorButton.addEventListener('click', () => {
      errorOverlay.classList.remove('active');
      setTimeout(() => errorOverlay.remove(), 300);
    });
    
    errorContainer.appendChild(errorIcon);
    errorContainer.appendChild(errorMessage);
    errorContainer.appendChild(errorButton);
    errorOverlay.appendChild(errorContainer);
    document.body.appendChild(errorOverlay);
    
    // Animate in
    setTimeout(() => {
      errorOverlay.classList.add('active');
    }, 10);
    
    // Close on overlay click
    errorOverlay.addEventListener('click', (e) => {
      if (e.target === errorOverlay) {
        errorOverlay.classList.remove('active');
        setTimeout(() => errorOverlay.remove(), 300);
      }
    });
  }
  
  function showPookieBox() {
    // Create pookie box overlay
    const pookieOverlay = document.createElement('div');
    pookieOverlay.classList.add('pookie-box-overlay');
    
    const pookieContainer = document.createElement('div');
    pookieContainer.classList.add('pookie-box-container');
    
    // Header with buttons
    const pookieHeader = document.createElement('div');
    pookieHeader.classList.add('pookie-box-header');
    
    const pookieTitle = document.createElement('div');
    pookieTitle.classList.add('pookie-box-title');
    pookieTitle.textContent = 'Developer.';
    
    const pookieButtons = document.createElement('div');
    pookieButtons.classList.add('pookie-box-buttons');
    
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('pookie-box-close');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => {
      pookieOverlay.classList.remove('active');
      setTimeout(() => pookieOverlay.remove(), 300);
    });
    
    const openInChromeBtn = document.createElement('button');
    openInChromeBtn.classList.add('pookie-box-open');
    openInChromeBtn.textContent = 'Open in Chrome';
    openInChromeBtn.addEventListener('click', () => {
      window.open('https://samfolio.carrd.co/', '_blank');
    });
    
    pookieButtons.appendChild(openInChromeBtn);
    pookieButtons.appendChild(closeBtn);
    
    pookieHeader.appendChild(pookieTitle);
    pookieHeader.appendChild(pookieButtons);
    
    // Embed for the URL
    const pookieEmbed = document.createElement('embed');
    pookieEmbed.classList.add('pookie-box-iframe');
    pookieEmbed.src = 'https://samfolio.carrd.co/';
    pookieEmbed.frameBorder = '0';
    pookieEmbed.style.width = '100%';
    pookieEmbed.style.height = '100%';
    
    pookieContainer.appendChild(pookieHeader);
    pookieContainer.appendChild(pookieEmbed);
    pookieOverlay.appendChild(pookieContainer);
    document.body.appendChild(pookieOverlay);
    
    // Animate in
    setTimeout(() => {
      pookieOverlay.classList.add('active');
    }, 10);
    
    // Close on overlay click
    pookieOverlay.addEventListener('click', (e) => {
      if (e.target === pookieOverlay) {
        pookieOverlay.classList.remove('active');
        setTimeout(() => pookieOverlay.remove(), 300);
      }
    });
  }
  
  function showSettingsMenu() {
    // Create settings overlay
    const settingsOverlay = document.createElement('div');
    settingsOverlay.classList.add('settings-overlay');
    
    const settingsContainer = document.createElement('div');
    settingsContainer.classList.add('settings-container');
    
    // Settings header
    const settingsHeader = document.createElement('div');
    settingsHeader.classList.add('settings-header');
    
    const settingsTitle = document.createElement('h3');
    settingsTitle.textContent = 'Settings';
    
    const settingsCloseBtn = document.createElement('button');
    settingsCloseBtn.classList.add('settings-close');
    settingsCloseBtn.textContent = '×';
    settingsCloseBtn.addEventListener('click', closeSettingsMenu);
    
    settingsHeader.appendChild(settingsTitle);
    settingsHeader.appendChild(settingsCloseBtn);
    
    // Settings options
    const settingsOptions = document.createElement('div');
    settingsOptions.classList.add('settings-options');
    
    // Theme setting
    const themeOption = document.createElement('div');
    themeOption.classList.add('settings-option');
    const currentTheme = localStorage.getItem('calculatorTheme') || 'light';
    themeOption.innerHTML = `
      <label class="settings-label">
        <span>Theme</span>
        <select class="theme-select">
          <option value="light" ${currentTheme === 'light' && !calculator.pookieMode ? 'selected' : ''}>Light</option>
          <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Dark</option>
          <option value="pookie" ${calculator.pookieMode || currentTheme === 'pookie' ? 'selected' : ''}>Pookie</option>
        </select>
      </label>
    `;
    
    // Sound setting
    const soundOption = document.createElement('div');
    soundOption.classList.add('settings-option');
    soundOption.innerHTML = `
      <label class="settings-label">
        <span>Sound Effects</span>
        <input type="checkbox" class="sound-toggle" ${calculator.soundEnabled ? 'checked' : ''}>
      </label>
    `;
    
    // UI Sound Settings
    const uiSoundsOption = document.createElement('div');
    uiSoundsOption.classList.add('settings-option');
    uiSoundsOption.innerHTML = `
      <label class="settings-label">
        <span>UI Sounds</span>
        <input type="checkbox" class="ui-sounds-toggle" ${calculator.uiSoundsEnabled !== 'none' ? 'checked' : ''}>
      </label>
    `;
    
    // Touch Gestures
    const gesturesOption = document.createElement('div');
    gesturesOption.classList.add('settings-option');
    gesturesOption.innerHTML = `
      <label class="settings-label">
        <span>Touch Gestures</span>
        <input type="checkbox" class="gestures-toggle" ${calculator.gesturesEnabled ? 'checked' : ''}>
      </label>
    `;
    
    // Vibration setting
    const vibrationOption = document.createElement('div');
    vibrationOption.classList.add('settings-option');
    vibrationOption.innerHTML = `
      <label class="settings-label">
        <span>Vibration</span>
        <input type="checkbox" class="vibration-toggle" ${calculator.vibrationEnabled ? 'checked' : ''}>
      </label>
    `;
    
    settingsOptions.appendChild(themeOption);
    settingsOptions.appendChild(soundOption);
    settingsOptions.appendChild(uiSoundsOption);
    settingsOptions.appendChild(vibrationOption);
    settingsOptions.appendChild(gesturesOption);
    
    settingsContainer.appendChild(settingsHeader);
    settingsContainer.appendChild(settingsOptions);
    settingsOverlay.appendChild(settingsContainer);
    document.body.appendChild(settingsOverlay);
    
    // Animate in
    setTimeout(() => {
      settingsOverlay.classList.add('active');
    }, 10);
    
    // Add event listeners
    const themeSelect = themeOption.querySelector('.theme-select');
    themeSelect.addEventListener('change', (e) => {
      changeTheme(e.target.value);
    });
    
    const soundToggle = soundOption.querySelector('.sound-toggle');
    soundToggle.addEventListener('change', (e) => {
      calculator.soundEnabled = e.target.checked;
      localStorage.setItem('calculatorSound', calculator.soundEnabled);
    });
    
    const uiSoundsToggle = uiSoundsOption.querySelector('.ui-sounds-toggle');
    uiSoundsToggle.addEventListener('change', (e) => {
      calculator.uiSoundsEnabled = e.target.checked ? 'all' : 'none';
      localStorage.setItem('calculatorUISounds', calculator.uiSoundsEnabled);
    });
    
    const vibrationToggle = vibrationOption.querySelector('.vibration-toggle');
    vibrationToggle.addEventListener('change', (e) => {
      calculator.vibrationEnabled = e.target.checked;
      localStorage.setItem('calculatorVibration', calculator.vibrationEnabled);
    });
    
    const gesturesToggle = gesturesOption.querySelector('.gestures-toggle');
    gesturesToggle.addEventListener('change', (e) => {
      calculator.gesturesEnabled = e.target.checked;
      localStorage.setItem('calculatorGestures', calculator.gesturesEnabled);
      if (calculator.gesturesEnabled) {
        calculator.enableGestures();
      } else {
        calculator.disableGestures();
      }
    });
    
    // Close on overlay click
    settingsOverlay.addEventListener('click', (e) => {
      if (e.target === settingsOverlay) {
        closeSettingsMenu();
      }
    });
  }
  
  function closeSettingsMenu() {
    const settingsOverlay = document.querySelector('.settings-overlay');
    if (settingsOverlay) {
      settingsOverlay.classList.remove('active');
      setTimeout(() => {
        settingsOverlay.remove();
        // Reset any blur effects
        const calculator = document.querySelector('.calculator');
        if (calculator) {
          calculator.style.filter = 'none';
          calculator.style.transition = 'none';
        }
      }, 300);
    }
  }
  
  function changeTheme(theme) {
    calculator.applyTheme(theme);
  }
  
  if (ribbonBtn) {
    ribbonBtn.addEventListener('click', () => {
      calculator.togglePookieMode();
    });
  }
});

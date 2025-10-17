# Calculator Sound System & Settings Guide

## 📁 Folder Structure

Create the following folder structure in your calculator directory:

```
calculator/
├── sounds/
│   ├── default/
│   │   ├── numbers.mp3     # Sound for number buttons (0-9)
│   │   ├── operators.mp3   # Sound for operator buttons (+, -, *, /)
│   │   ├── functions.mp3   # Sound for function buttons (%, ±, etc.)
│   │   ├── memory.mp3      # Sound for memory buttons (M+, M-, MR, MC)
│   │   ├── equals.mp3      # Sound for equals button (=)
│   │   ├── clear.mp3       # Sound for clear button (C/AC)
│   │   ├── gestures.mp3    # Sound for touch gesture triggers
│   │   └── pookie-activation.mp3  # Special sound for pookie mode activation
│   └── pookie/
│       ├── numbers.mp3     # Different sound for pookie mode numbers
│       ├── operators.mp3   # Different sound for pookie mode operators
│       ├── functions.mp3   # Different sound for pookie mode functions
│       ├── memory.mp3      # Different sound for pookie mode memory
│       ├── equals.mp3      # Different sound for pookie mode equals
│       ├── clear.mp3       # Different sound for pookie mode clear
│       ├── gestures.mp3    # Different sound for pookie mode gestures
│       ├── error_messages.txt     # iOS-style error messages for history clicks
│       └── pookie-activation.mp3  # Special sound for pookie mode activation
└── index.html
```

## 🎵 Sound Files

- **Default Mode**: Standard calculator sounds for each button group
- **Pookie Mode**: Fun, different sounds for each button group in pink theme
- **Text Files**: Plain text files for dynamic content
- **File Names**: Must match exactly as listed above

## ⚙️ Features

- **Granular Sound Control**: Different sounds for each button category
- **Mode-Specific Sounds**: Completely different sound sets for default and pookie modes
- **UI Sound Settings**: Control which sound categories play (All/Minimal/None)
- **Touch Gestures**: Long-press detection for advanced interactions
- **Pookie Activation Sound**: Special audio cue when entering pookie mode
- **Calculation History**: Save and display last 10 calculations with pink styling
- **iOS Error Popups**: Fun error messages when clicking history items

## 🔘 Button Categories

| Category | Buttons | Default Sound | Pookie Sound | Description |
|----------|---------|---------------|--------------|-------------|
| Numbers | 0-9, . | `numbers.mp3` | `numbers.mp3` | Number input sounds |
| Operators | +, -, ×, ÷ | `operators.mp3` | `operators.mp3` | Mathematical operators |
| Functions | %, ±, etc. | `functions.mp3` | `functions.mp3` | Special functions |
| Memory | M+, M-, MR, MC | `memory.mp3` | `memory.mp3` | Memory operations |
| Equals | = | `equals.mp3` | `equals.mp3` | Calculation result |
| Clear | C, AC | `clear.mp3` | `clear.mp3` | Clear operations |
| **Gestures** | **Long Press** | **`gestures.mp3`** | **`gestures.mp3`** | **Touch gesture triggers** |
| **Pookie Activation** | **Mode Toggle** | **-** | **`pookie-activation.mp3`** | **Special sound when entering pookie mode** |

## ⚙️ Settings Menu

The calculator includes a comprehensive settings menu accessible via the ☰ button:

### 📱 Menu Options
- **Settings**: Access sound, theme, and interface preferences
- **History**: View calculation history with pink styling
- **About**: App information and version details

### 🎵 Sound Settings
- **Sound Effects**: Master toggle for all audio playback
- **UI Sounds**: Toggle to enable/disable UI sound effects
  - **Checked**: All button sounds play
  - **Unchecked**: No UI sounds (silent)
- **Vibration**: Toggle for haptic feedback on supported devices

### 👆 Interface Settings
- **Touch Gestures**: Enable/disable advanced touch interactions
  - **Enabled**: Long press buttons for 500ms to trigger special actions
  - **Disabled**: Standard single-tap behavior only

### 🎨 Theme Settings
- **Theme**: Switch between Light, Dark, and Pookie themes
- **Persistent**: Settings are saved and restored on app restart

## 🚀 Usage Guide

### 1. **Setup Sound Files**
1. Create the folder structure as shown above
2. Drop your MP3 files into the appropriate folders with exact names
3. Ensure file names match exactly (case-sensitive)

### 2. **Configure Settings**
1. Click the ☰ button to open the menu
2. Select "Settings"
3. Adjust the following options:
   - **Sound Effects**: Toggle ON/OFF
   - **UI Sounds**: Toggle ON/OFF for UI sound effects
   - **Touch Gestures**: Toggle ON/OFF
   - **Theme**: Select Light/Dark/Pookie

### 3. **Use the Calculator**
- **Button Sounds**: Each button category plays its designated sound
- **Mode Switching**: Switch between default and pookie modes for different sound sets
- **Pookie Activation**: Hear a special sound when entering pookie mode
- **Touch Gestures**: Long press buttons when gestures are enabled
- **Calculation History**: Click ☰ → History to view your last 10 calculations
- **History Interactions**: Click any history item for a fun iOS-style error message

## 📋 Text Files

Your calculator now includes dynamic text content loaded from external files:

### 📝 `history_lines.txt`
Contains 10 different descriptions for history items:
- Each line corresponds to a different history state
- Lines are cycled through for variety
- Edit this file to customize history descriptions

### ⚠️ `error_messages.txt`
Contains 12+ fun iOS-style error messages:
- Randomly selected when clicking history items
- Add your own humorous error messages
- Each message appears in a beautiful pink error popup

### 🔄 Dynamic Loading
- Files are loaded asynchronously when opening history
- Falls back to hardcoded arrays if files are missing
- Edit files without restarting the calculator

## 🎯 iOS Authenticity

- **Visual Design**: Matches native iOS Calculator app
- **Animations**: Smooth transitions and hover effects
- **Sound Design**: Contextual audio feedback
- **Gesture Support**: Advanced touch interactions
- **Settings UI**: Native iOS-style settings panel
- **Error Handling**: iOS-style error popups
- **History Interface**: Pink-themed calculation history

## 🛠️ Troubleshooting

- **No UI Sounds**: Ensure "UI Sounds" is checked in settings
- **Wrong Sound**: Ensure file names match exactly (case-sensitive)
- **Playback Issues**: Some browsers may require user interaction to enable audio
- **Settings Not Saving**: Check if localStorage is enabled in your browser
- **Gestures Not Working**: Ensure Touch Gestures is enabled in settings
- **History Not Showing**: Perform calculations first, then check ☰ → History
- **Text Files Not Loading**: Ensure files exist in the correct folders

## 📱 Complete Feature Set

Your calculator now includes:
- ✅ **Granular Sound Control** (8 different sound categories including gestures and pookie activation)
- ✅ **Mode-Specific Sounds** (different for default/pookie modes)
- ✅ **UI Sound Settings** (All/None toggle options)
- ✅ **Touch Gestures** (long-press detection with sound effects)
- ✅ **Pookie Activation Sound** (special audio cue when entering pookie mode)
- ✅ **Calculation History** (last 10 calculations with pink styling)
- ✅ **iOS Error Popups** (fun messages when clicking history items)
- ✅ **Dynamic Text Loading** (customizable history and error messages)
- ✅ **Theme Management** (Light/Dark/Pookie with persistence)
- ✅ **iOS-Style Interface** (authentic design and animations)
- ✅ **Settings Persistence** (preferences saved across sessions)

The system automatically detects which mode you're in and plays the appropriate sounds for each button category!

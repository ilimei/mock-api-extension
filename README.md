# MockAPI Chrome Extension

A powerful Chrome extension that allows developers to intercept and mock API calls for frontend development and testing. With MockAPI, you can simulate backend responses, test error scenarios, and develop frontend features without waiting for backend implementation.

## Features

- 🔄 Intercept and mock API requests and responses
- 🎯 Match requests based on URL patterns, methods, and headers
- ⏱️ Simulate network delays and conditions
- 📦 Save and organize mock configurations
- 🔍 Debug and explore actual network requests
- 🔒 Local storage of mock data with no server dependencies

## Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store](#) (link will be available after publication)
2. Click "Add to Chrome"
3. Confirm the installation when prompted

### Manual Installation (Developer Mode)
1. Clone this repository or download the source code
2. Navigate to `chrome://extensions/` in your Chrome browser
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the `public` directory from this project

## Usage

1. Click on the MockAPI extension icon in your browser toolbar
2. Create a new mock configuration by specifying URL patterns and desired responses
3. Enable your mock configurations as needed
4. Browse websites and the extension will intercept matching requests

For detailed usage instructions, visit the Options page by right-clicking the extension icon and selecting "Options".

## Project Structure

```
mock-api-extension
├── src
│   ├── popup
│   │   ├── popup.html        # HTML entry point for the popup interface
│   │   └── popup.ts          # TypeScript code for popup functionality
│   ├── options
│   │   ├── options.html      # HTML entry point for the options/settings page
│   │   └── options.ts        # TypeScript code for managing settings
│   ├── background
│   │   └── index.ts          # Background script managing events and tasks
│   └── content
│       └── index.ts          # Content script interacting with web pages
├── public
│   ├── icons
│   │   ├── icon-16.png       # Icon (16x16 pixels)
│   │   ├── icon-48.png       # Icon (48x48 pixels)
│   │   └── icon-128.png      # Icon (128x128 pixels)
│   └── manifest.json         # Manifest file defining extension properties
├── build.mjs                 # build file
├── package.json              # npm configuration file
├── tsconfig.json             # TypeScript configuration file
├── PRIVACY.md                # PRIVACY documentation
└── README.md                 # Project documentation
```

## Development

### Prerequisites
- Node.js (v14 or newer)
- npm or yarn

### Setup
1. Clone the repository
```
git clone https://github.com/yourusername/mock-api-extension.git
cd mock-api-extension
```

2. Install dependencies
```
npm install
```

3. Start the development build
```
npm run dev
```

4. Load the extension in Chrome
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the `public` directory

### Building for Production
```
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For bugs, feature requests, or support questions, please create an issue on the GitHub repository.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
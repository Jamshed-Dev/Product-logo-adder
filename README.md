# Product Logo Adder

Effortlessly Add Custom Logos to Your Product Images

![App Preview](https://finesseglow.com/wp-content/uploads/2025/02/AXIS-Y-Dark-Spot-Correcting-Glow-Serum-50ml-09.png)

## test URL
https://plogo.netlify.app/

## Overview
The **Product Logo Adder** is a React-based web application designed to simplify batch image processing for e-commerce businesses and digital marketers. It allows users to add custom logos, watermarks, and backgrounds to multiple images simultaneously with real-time previews and professional results.

## Key Features
- **Logo Overlay**: Upload custom logos with adjustable opacity, scale, and positioning.
- **Text Watermarks**: Add branded text with customizable fonts, colors, and placement.
- **Batch Processing**: Process unlimited images in parallel.
- **Background Removal**: Remove backgrounds using the [Remove.bg API](https://www.remove.bg/api).
- **Dynamic Preview**: Instant visual updates as you adjust settings.
- **Quality Control**: Adjust JPEG/WebP compression (0–100%).
- **Output Formats**: Export images in JPEG, PNG, or WebP.
- **Drag-and-Drop Sorting**: Reorder images effortlessly.
- **Undo/Redo History**: Track all edits and revert changes.

## Quick Start

### Prerequisites
- **Node.js (v18+)**
- **Remove.bg API Key** (Free tier available)

### Installation
```bash
# Clone the repository
git clone https://github.com/Jamshed-Dev/Product-logo-adder.git  
cd product-logo-adder  

# Install dependencies
npm install  
```

### Configuration
Create a `.env` file in the root directory and add your Remove.bg API key:
```env
API_KEY=your_remove.bg_api_key  
```
Replace placeholder text/images with your assets.

### Run the App
```bash
npm start  
```

## Usage
1. **Upload Images**: Drag-and-drop files into the app.
2. **Add Logos**: Upload your logo and adjust settings.
3. **Adjust Settings**: Modify text, background color, and quality.
4. **Process Images**: Click "Process" to generate results.
5. **Download**: Save processed images as a ZIP file.

## Tech Stack
- **Frontend**: React, TypeScript, Canvas API
- **State Management**: React Query
- **APIs**: Remove.bg (background removal)
- **Utilities**:
  - Axios (HTTP requests)
  - JSZip (file compression)
  - FileSaver (file downloads)

## Contributing
1. **Fork the Repo**: Click the fork button on GitHub.
2. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Commit Changes**:
   ```bash
   git commit -m "Add feature: description"
   ```
4. **Push and Submit a Pull Request**

## License
This project is licensed under the **MIT License**.

## Feedback
- Open an issue on GitHub for any suggestions or bugs.
- Visit [jamshed.dev](https://jamshed.dev) for more projects and support.

---

Built with ❤️ by [Jamshed](https://github.com/Jamshed-Dev).


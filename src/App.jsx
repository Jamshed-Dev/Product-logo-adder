import React, { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "./styles.css";
import axios from 'axios';

function App() {
  const [images, setImages] = useState([]);
  const [logo, setLogo] = useState(null);
  const [textWatermark, setTextWatermark] = useState("");
  const [fontSize, setFontSize] = useState(20);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [cropRatio, setCropRatio] = useState("none");
  const [outputFormat, setOutputFormat] = useState("jpeg");
  const [processedImages, setProcessedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [logoPosition, setLogoPosition] = useState({ x: 0.5, y: 0.9 }); // Store as percentages (0-1)
  const [logoScale, setLogoScale] = useState(20); // Default to 20%
  const [logoOpacity, setLogoOpacity] = useState(100);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [previewImage, setPreviewImage] = useState(null); // State for the preview image
    const previewImageRef = useRef(null); // Ref for the preview image element
    const [qualityValue, setQualityValue] = useState(100);
    const [removeBackground, setRemoveBackground] = useState(false);


  // State Variables
  const [nameSuffix, setNameSuffix] = useState("Finesse Glow");
  const [quality, setQuality] = useState(2); // Only affects JPEG/WebP

    // Quality Mapping (Only for JPEG/WebP)
    const QUALITY_MAP = {
        1: 1.0,  // Very High
        2: 0.95, // High
        3: 0.75, // Medium
        4: 0.5   // Low
    };

    useEffect(() => {
    // Update the preview image whenever the 'images' state changes
    if (images.length > 0) {
      setPreviewImage(URL.createObjectURL(images[0]));
    } else {
      setPreviewImage(null);
    }
  }, [images]);


  const handleLogoPositionClick = (event) => {
    if (!previewImageRef.current) return;

    const rect = previewImageRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate relative coordinates (percentages)
    const relativeX = x / rect.width;
    const relativeY = y / rect.height;

    setLogoPosition({ x: relativeX, y: relativeY });
  };

  const removeBg = async (imageFile) => {
    const apiKey = 'vDK8em9JeunhTP312DRqRHqX'; // Replace with your actual API key
    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('size', 'auto');

    try {
      const response = await axios.post(
        'https://api.remove.bg/v1.0/removebg',
        formData,
        {
          headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob', // Important: response type should be blob
        }
      );

      return new File([response.data], 'no-bg.png', { type: 'image/png' }); // Create a File object from the blob
    } catch (error) {
      console.error('Error removing background:', error);
      alert('Error removing background. Please check your API key and try again.');
      return null;
    }
  };


  const handleProcess = async () => {
      const processed = images.map(async (image) => {
          let processedImage = image;

          if (removeBackground) {
              processedImage = await removeBg(image);
              if (!processedImage) {
                  return null; // Skip processing if background removal fails
              }
          }
          return new Promise((resolve) => {
              const img = new Image();
              img.src = URL.createObjectURL(processedImage);

              img.onload = () => {
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");

                  let newWidth = img.width;
                  let newHeight = img.height;
                  let imgX = 0;
                  let imgY = 0;

                  // Calculate new dimensions based on selected aspect ratio
                  if (cropRatio === "nocropimage") {
                      // Force 1:1 aspect ratio
                      if (img.width > img.height) {
                          newWidth = img.width;
                          newHeight = img.width;
                          imgY = (newHeight - img.height) / 2;
                      } else {
                          newWidth = img.height;
                          newHeight = img.height;
                          imgX = (newWidth - img.width) / 2;
                      }
                  }
                  else if (cropRatio !== "none") {
                      const [ratioW, ratioH] = cropRatio.split(":").map(Number);
                      const aspectRatio = ratioW / ratioH;
                      const imgAspectRatio = img.width / img.height;

                      if (imgAspectRatio > aspectRatio) {
                          newWidth = img.height * aspectRatio;
                      } else {
                          newHeight = img.width / aspectRatio;
                      }
                  }

                  // Set canvas dimensions
                  canvas.width = newWidth;
                  canvas.height = newHeight;

                  // Fill background color
                  ctx.fillStyle = backgroundColor;
                  ctx.fillRect(0, 0, newWidth, newHeight);

                  // Center the image

                  ctx.drawImage(img, imgX, imgY, img.width, img.height); // Draw original image

                  // Add logo and text watermark
                  addLogoAndWatermark(ctx, newWidth, newHeight, resolve);

                  URL.revokeObjectURL(img.src);
              };

              img.onerror = (error) => {
                  console.error("Error loading image:", error);
                  URL.revokeObjectURL(img.src);
                  resolve(null);
              };
          });
      });

    Promise.all(processed).then((dataUrls) => {
      const validResults = dataUrls.filter((result) => result);
      setProcessedImages(
        validResults.map((dataUrl, index) => ({
          dataUrl,
          outputName: `${nameSuffix}_${index + 1}.${outputFormat}`,
        }))
      );
    });
  };

const addLogoAndWatermark = (ctx, newWidth, newHeight, resolve) => {
    if (logo) {
      const logoImg = new Image();
      logoImg.src = URL.createObjectURL(logo);
      logoImg.onload = () => {
        const logoAspectRatio = logoImg.width / logoImg.height;
        let logoWidth = (newWidth * logoScale) / 100;
        let logoHeight = logoWidth / logoAspectRatio;

        // Ensure logo fits within canvas dimensions
        if (logoWidth > newWidth) {
          logoWidth = newWidth;
          logoHeight = logoWidth / logoAspectRatio;
        }
        if (logoHeight > newHeight) {
          logoHeight = newHeight;
          logoWidth = logoHeight * logoAspectRatio;
        }

        // Calculate logo position based on relative coordinates
        const logoX = Math.max(0, Math.min((newWidth * logoPosition.x - logoWidth / 2 ), newWidth - logoWidth));
        const logoY = Math.max(0, Math.min((newHeight * logoPosition.y - logoHeight / 2), newHeight - logoHeight));

        ctx.globalAlpha = logoOpacity / 100;
        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
        ctx.globalAlpha = 1;

        addTextWatermark(ctx, newWidth, newHeight, resolve);
      };
      logoImg.onerror = () => {
        console.error("Error loading logo image");
        resolve(null); // Resolve with null if logo loading fails
      }
    } else {
      addTextWatermark(ctx, newWidth, newHeight, resolve);
    }
  };

  const addTextWatermark = (ctx, canvasWidth, canvasHeight, resolve) => {
    if (textWatermark) {
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText(
        textWatermark,
        canvasWidth - 10,
        canvasHeight - 10
      );
    }

    // Quality only affects JPEG/WebP
    const mimeType = `image/${outputFormat}`;
    const qualityValueToUse =
      outputFormat === "jpeg" || outputFormat === "webp"
        ? qualityValue / 100
        : undefined; // Pass undefined for PNG, which doesn't use quality

    resolve(ctx.canvas.toDataURL(mimeType, qualityValueToUse));
  };

  const handleDownloadAll = () => {
    const zip = new JSZip();

    processedImages.forEach(({ dataUrl, outputName }) => {
      const byteString = atob(dataUrl.split(",")[1]);
      const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }

      zip.file(outputName, uint8Array, { binary: true });
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "processed_images.zip");
    });
  };

  const openModal = (dataUrl) => {
    setSelectedImage(dataUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
      if (updatedImages.length > 0) {
        setPreviewImage(URL.createObjectURL(updatedImages[0]));
    } else {
        setPreviewImage(null); // Clear preview if no images
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith("image/")
    );

    if (files.length > 0) {
      setImages([...images, ...files]);
    } else {
      alert("Please upload image files only.");
    }
  };

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    if (newFiles.length > 0) {
        setImages([...images, ...newFiles]);
    } else {
        alert("Please upload image files only.");
    }
};

const LogoPreview = () => {
    if (!logo) return null;

    const logoUrl = URL.createObjectURL(logo);
    const logoWidth = logoScale; // Use percentage for width
    const logoHeight = logoScale;

    return (
        <div
            className="logo-preview"
            style={{
                position: 'absolute',
                left: `calc(${logoPosition.x * 100}% - ${logoWidth / 2}%)`,
                top: `calc(${logoPosition.y * 100}% - ${logoHeight / 2}%)`,
                width: `${logoWidth}%`,
                height: `${logoHeight}%`,
                opacity: logoOpacity / 100,
                pointerEvents: 'none',
            }}
        >
            <img src={logoUrl} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
    );
};

  return (
    <div className={`App ${isDarkMode ? "dark-mode" : ""}`}>
      <h1>Image Processor</h1>

      {/* Dark Mode Toggle */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          <input type="checkbox" checked={isDarkMode} onChange={toggleDarkMode} />
          Enable Dark Mode
        </label>
      </div>

      {/* Name Suffix */}
      <div>
        <label>
          Name Suffix (Base Name):
          <input
            type="text"
            value={nameSuffix}
            onChange={(e) => setNameSuffix(e.target.value)}
          />
        </label>
      </div>

      {/* Image Upload */}
      <div>
        <label>
          Upload Images:

        </label>
      </div>

      {/* Drag and Drop Zone */}
      <div
        className="drop-zone"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={handleDrop}
      >
        <p>Drag and drop images here
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
          />
        </p>
        {/* Image List */}
        <div className="image-list">
          {images.map((file, index) => (
            <div key={index} className="image-item">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="image-preview1"
              />
              <div className="image-actions">
                <cloce onClick={() => removeImage(index)}>❌</cloce>
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* Preview Image and Logo Positioning */}
      {previewImage && (
        <div className="preview-container">
          <div className="interactive-preview">
            <img
              src={previewImage}
              alt="Preview"
              className="preview-image interactive"
              onClick={handleLogoPositionClick}
              ref={previewImageRef}
            />
             <LogoPreview />
            {/* Visual Indicator for Logo Position */}
            {logo && (
              <div
                className="logo-indicator"
                style={{
                  left: `calc(${logoPosition.x * 100}% - 10px)`, // 10px is half the indicator size
                  top: `calc(${logoPosition.y * 100}% - 10px)`,  // 10px is half the indicator size
                }}
              ></div>
            )}
          </div>
        </div>
      )}


      {/* Logo Upload */}
      <div>
        <label>
          Upload Logo:<br />
          <input type="file" onChange={(e) => setLogo(e.target.files[0])} />
        </label>
      </div>

      {/* Logo Settings */}
      <div>
        <div className="range-container">
        <label>
          Logo Scale (%):
          </label>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={logoScale}
            onChange={(e) => setLogoScale(parseInt(e.target.value))}
          />
          <span className="range-value">{logoScale}%</span>
        </div>

        <div className="range-container">
        <label>
          Logo Opacity (%):
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={logoOpacity}
            onChange={(e) => setLogoOpacity(parseInt(e.target.value))}
          />
          <span className="range-value">{logoOpacity}%</span>
        </div>
      </div>

       {/* Quality Settings */}
       <div>
        <div className="range-container">
          <label>Quality (JPEG/WebP):</label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={qualityValue}
            onChange={(e) => setQualityValue(parseInt(e.target.value))}
          />
          <span className="range-value">{qualityValue}%</span>
        </div>
      </div>

      {/* Output Format */}
      <div>
        <label>
          Output Format:
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </label>
      </div>

      {/* Text Watermark */}
      <div>
        <label>
          Text Watermark:
          <input
            type="text"
            value={textWatermark}
            onChange={(e) => setTextWatermark(e.target.value)}
          />
        </label>

        <label>
          Font Size:
          <input
            type="number"
            value={fontSize}
            min="8"
            max="72"
            onChange={(e) => setFontSize(parseInt(e.target.value))}
          />
        </label>
      </div>

      {/* Background Color */}
      <div>
        <label>
          Background Color:
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </label>
      </div>

      {/* Crop Settings */}
      <div>
        <label>
          Crop Ratio:
          <select
            value={cropRatio}
            onChange={(e) => setCropRatio(e.target.value)}
          >
            <option value="none">None</option>
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
            <option value="1:1">1:1</option>
            <option value="nocropimage">nocropimage</option>
          </select>
        </label>
      </div>

       {/* Remove Background Toggle */}
       <div>
        <label>
          Remove Background:
          <input
            type="checkbox"
            checked={removeBackground}
            onChange={(e) => setRemoveBackground(e.target.checked)}
          />
        </label>
      </div>

      {/* Process Button */}
      <button onClick={handleProcess}>Process Images</button>

      {/* Preview Section */}
      <div className="preview-container">
        {processedImages.length > 0 ? (
          processedImages.map(({ dataUrl, outputName }, index) => (
            <div
              key={index}
              className="image-preview"
              onClick={() => openModal(dataUrl)}
            >
              <img
                src={dataUrl}
                alt={outputName}
                className="preview-image"
              />
            </div>
          ))
        ) : (
          <div className="no-images">
            <p>No images to preview.</p>
          </div>
        )}
      </div>

      {/* Download All Button */}
      {processedImages.length > 0 && (
        <button onClick={handleDownloadAll}>Download All Images</button>
      )}

      {/* Modal for Image Preview */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={closeModal}>
              &times;
            </span>
            <img
              src={selectedImage}
              alt="Preview"
              className="modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

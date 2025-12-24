#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const WIDTH = 1200;
const HEIGHT = 630;
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'og-image.jpg');
const LOGO_PATH = path.join(__dirname, '..', 'public', 'shalean-logo.png');

// Brand colors
const THEME_COLOR = '#10b981'; // Emerald green
const BACKGROUND_COLOR = '#ffffff'; // White
const TEXT_COLOR = '#2c3e50'; // Dark gray
const SUBTITLE_COLOR = '#34495e'; // Slightly lighter gray

async function generateOGImage() {
  try {
    console.log('🎨 Generating OG image...\n');

    // Check if logo exists
    if (!fs.existsSync(LOGO_PATH)) {
      throw new Error(`Logo not found at ${LOGO_PATH}`);
    }

    // Create SVG with text and background
    const svg = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background with subtle gradient -->
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${BACKGROUND_COLOR};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f8f9fa;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${THEME_COLOR};stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:${THEME_COLOR};stop-opacity:0.05" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGradient)"/>
        
        <!-- Decorative accent bar at top -->
        <rect width="${WIDTH}" height="8" fill="${THEME_COLOR}" opacity="0.8"/>
        
        <!-- Main text: "Professional Cleaning Services Cape Town" -->
        <text 
          x="${WIDTH / 2}" 
          y="${HEIGHT / 2 + 40}" 
          font-family="system-ui, -apple-system, 'Segoe UI', Arial, sans-serif" 
          font-size="64" 
          font-weight="700" 
          fill="${TEXT_COLOR}" 
          text-anchor="middle"
          letter-spacing="-0.02em">
          Professional Cleaning Services
        </text>
        
        <!-- Location text: "Cape Town" -->
        <text 
          x="${WIDTH / 2}" 
          y="${HEIGHT / 2 + 110}" 
          font-family="system-ui, -apple-system, 'Segoe UI', Arial, sans-serif" 
          font-size="56" 
          font-weight="700" 
          fill="${THEME_COLOR}" 
          text-anchor="middle"
          letter-spacing="-0.01em">
          Cape Town
        </text>
        
        <!-- Subtitle: "Shalean Cleaning Services" -->
        <text 
          x="${WIDTH / 2}" 
          y="${HEIGHT - 80}" 
          font-family="'Comic Sans MS', 'Marker Felt', 'Chalkboard', 'Bradley Hand', cursive, system-ui" 
          font-size="36" 
          font-weight="900" 
          fill="${SUBTITLE_COLOR}" 
          text-anchor="middle"
          letter-spacing="-0.02em"
          opacity="0.8">
          Shalean Cleaning Services
        </text>
      </svg>
    `;

    // Convert SVG to image buffer
    const svgBuffer = Buffer.from(svg);
    const backgroundImage = await sharp(svgBuffer)
      .resize(WIDTH, HEIGHT)
      .toBuffer();

    // Load and process logo
    const logoMetadata = await sharp(LOGO_PATH).metadata();
    const logoWidth = Math.min(300, WIDTH * 0.25); // Max 25% of width or 300px
    const logoHeight = Math.round((logoWidth / logoMetadata.width) * logoMetadata.height);
    
    const logo = await sharp(LOGO_PATH)
      .resize(logoWidth, logoHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .toBuffer();

    // Calculate logo position (top-left with padding)
    const logoPadding = 60;
    const logoX = logoPadding;
    const logoY = logoPadding + 20; // Extra space for accent bar

    // Composite logo onto background
    await sharp(backgroundImage)
      .composite([
        {
          input: logo,
          top: logoY,
          left: logoX,
        },
      ])
      .jpeg({ quality: 92, mozjpeg: true })
      .toFile(OUTPUT_PATH);

    console.log(`✅ OG image generated successfully!`);
    console.log(`   Location: ${OUTPUT_PATH}`);
    console.log(`   Dimensions: ${WIDTH}x${HEIGHT}px`);
    console.log(`   Format: JPEG`);
    console.log(`   Quality: 92%\n`);

    // Verify the output
    const outputMetadata = await sharp(OUTPUT_PATH).metadata();
    if (outputMetadata.width !== WIDTH || outputMetadata.height !== HEIGHT) {
      console.warn(`⚠️  Warning: Output dimensions are ${outputMetadata.width}x${outputMetadata.height}, expected ${WIDTH}x${HEIGHT}`);
    } else {
      console.log('✅ Image dimensions verified correctly!\n');
    }

  } catch (error) {
    console.error('❌ Error generating OG image:', error.message);
    process.exit(1);
  }
}

// Run the script
generateOGImage();


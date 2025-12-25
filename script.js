// State management
const selections = {
    icons: {},
    headingFont: null,
    bodyFont: null,
    footerColor: '#1a1f3c'
};

// Color Wheel Setup
function initColorWheel() {
    const canvas = document.getElementById('colorWheel');
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;

    // Draw color wheel
    for (let angle = 0; angle < 360; angle++) {
        const startAngle = (angle - 1) * Math.PI / 180;
        const endAngle = (angle + 1) * Math.PI / 180;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(0.5, `hsl(${angle}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${angle}, 100%, 25%)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // Add click handler
    canvas.addEventListener('click', handleWheelClick);
    canvas.addEventListener('mousemove', (e) => {
        if (e.buttons === 1) handleWheelClick(e);
    });
}

function handleWheelClick(e) {
    const canvas = document.getElementById('colorWheel');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const color = rgbToHex(pixel[0], pixel[1], pixel[2]);
    
    // Update pointer position
    const pointer = document.querySelector('.color-pointer');
    pointer.style.left = x + 'px';
    pointer.style.top = y + 'px';
    pointer.style.backgroundColor = color;
    
    // Apply brightness
    const brightness = document.getElementById('brightnessSlider').value;
    const adjustedColor = adjustBrightness(color, brightness);
    
    updateFooterColor(adjustedColor);
    
    // Deselect presets
    document.querySelectorAll('.preset-color').forEach(opt => opt.classList.remove('selected'));
}

function adjustBrightness(hex, brightness) {
    const rgb = hexToRgb(hex);
    const factor = brightness / 50;
    
    const r = Math.min(255, Math.round(rgb.r * factor));
    const g = Math.min(255, Math.round(rgb.g * factor));
    const b = Math.min(255, Math.round(rgb.b * factor));
    
    return rgbToHex(r, g, b);
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// Icon Selection
function selectIcon(category, element) {
    const categoryEl = document.querySelector(`[data-category="${category}"]`);
    categoryEl.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    
    const iconName = element.querySelector('.icon-name').textContent;
    const iconSvg = element.querySelector('.icon-display').innerHTML;
    selections.icons[category] = { name: iconName, svg: iconSvg };
    
    updateSummary();
}

// Font Selection
function selectHeadingFont(element) {
    document.querySelectorAll('.heading-fonts .font-card').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selections.headingFont = element.querySelector('.font-card-name').textContent;
    updateSummary();
}

function selectBodyFont(element) {
    document.querySelectorAll('.body-fonts .font-card').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selections.bodyFont = element.querySelector('.font-card-name').textContent;
    updateSummary();
}

// Color Selection
function selectPresetColor(element) {
    document.querySelectorAll('.preset-color').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    
    const color = element.dataset.color;
    updateFooterColor(color);
}

function updateCustomColor(color) {
    document.querySelectorAll('.preset-color').forEach(opt => opt.classList.remove('selected'));
    document.getElementById('colorHex').value = color;
    updateFooterColor(color);
}

function updateFromHex(value) {
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        document.querySelectorAll('.preset-color').forEach(opt => opt.classList.remove('selected'));
        document.getElementById('customColor').value = value;
        updateFooterColor(value);
    }
}

function updateFooterColor(color) {
    const footer = document.getElementById('footerPreview');
    footer.style.backgroundColor = color;
    
    const rgb = hexToRgb(color);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    const textColor = brightness > 128 ? '#1a1f3c' : '#ffffff';
    footer.style.color = textColor;
    
    if (brightness > 200) {
        footer.style.border = '1px solid #e8e0d0';
    } else {
        footer.style.border = 'none';
    }
    
    document.getElementById('selectedColorValue').textContent = color;
    document.getElementById('colorHex').value = color;
    document.getElementById('customColor').value = color;
    document.getElementById('selectedColorPreview').style.backgroundColor = color;
    
    selections.footerColor = color;
    updateSummary();
}

function getColorName(hex) {
    const colorNames = {
        '#1a1f3c': 'Dark Blue',
        '#2a3158': 'Blue Light',
        '#0d1020': 'Navy',
        '#3d4470': 'Slate Blue',
        '#f5f0e8': 'Beige',
        '#e8e0d0': 'Beige Dark',
        '#d4c9b8': 'Warm Taupe',
        '#ffffff': 'White',
        '#faf8f5': 'Off White'
    };
    return colorNames[hex.toLowerCase()] || 'Custom';
}

// Update Summary
function updateSummary() {
    // Icons
    const iconsSummary = document.getElementById('summaryIcons');
    const iconCategories = Object.keys(selections.icons);
    
    if (iconCategories.length > 0) {
        iconsSummary.innerHTML = iconCategories.map(cat => {
            const icon = selections.icons[cat];
            const categoryName = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return `
                <div class="summary-icon-item">
                    <div style="width: 28px; height: 28px;">${icon.svg.replace(/stroke="#1a1f3c"/g, 'stroke="currentColor"').replace(/fill="#1a1f3c"/g, 'fill="currentColor"')}</div>
                    <span>${categoryName}</span>
                </div>
            `;
        }).join('');
    }
    
    // Fonts
    document.getElementById('summaryHeadingFont').textContent = selections.headingFont || 'Not selected';
    document.getElementById('summaryBodyFont').textContent = selections.bodyFont || 'Not selected';
    
    // Color
    const colorSummary = document.getElementById('summaryColor');
    const colorName = getColorName(selections.footerColor);
    colorSummary.innerHTML = `<span style="display: inline-block; width: 20px; height: 20px; background: ${selections.footerColor}; border-radius: 4px; vertical-align: middle; margin-right: 8px; border: 1px solid rgba(255,255,255,0.2);"></span>${selections.footerColor} (${colorName})`;
}

// Export Selections
function exportSelections() {
    const exportData = {
        icons: Object.entries(selections.icons).map(([cat, icon]) => ({
            category: cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            selected: icon.name
        })),
        typography: {
            headingFont: selections.headingFont,
            bodyFont: selections.bodyFont
        },
        footerColor: {
            hex: selections.footerColor,
            name: getColorName(selections.footerColor)
        },
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'moire-selections.json';
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Selections exported! Check your downloads folder for moire-selections.json');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initColorWheel();
    updateSummary();
});


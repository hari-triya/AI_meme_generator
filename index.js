// Global variables
let uploadedImage = null;
let currentCaption = '';
let detectedTags = [];
let textColor = '#FFFFFF';
let fontSize = 40;
let textPosition = 'top';
let fontStyle = 'Impact';
let strokeWidth = 4;
let lineSpacing = 1.2;
let textAlign = 'center';
let usedCaptions = [];
let memeHistory = [];
let historyCanvasData = [];

// Enhanced caption database (with \n properly escaped as \\n)
const captionDatabase = {
  animals: [
    "WHEN SOMEONE SAYS YOUR NAME\\nAND YOU WEREN'T LISTENING",
    "NOBODY:\\nABSOLUTELY NOBODY:\\nME:",
    "THAT FACE WHEN\\nYOU REALIZE IT'S MONDAY",
    "LIVING MY BEST LIFE",
    "CHAOS GOBLIN ACTIVATED",
    "PEAK PERFORMANCE ACHIEVED",
    "ME PRETENDING TO PAY ATTENTION",
    "WHEN YOU FIND THE SNACKS",
    "JUDGING YOU SILENTLY",
    "THIS IS FINE",
    "MONDAY MOOD",
    "CAUGHT RED-PAWED"
  ],
  people: [
    "ME AFTER 5 MINUTES OF WORK",
    "EXPECTATION VS REALITY",
    "POV: YOU FORGOT SOMETHING\\nIMPORTANT",
    "YEAH, THIS IS FINE\\nEVERYTHING IS FINE",
    "LIVING THE DREAM",
    "ME EXPLAINING MY LIFE CHOICES\\nTO ABSOLUTELY NOBODY",
    "WHEN SOMEONE MAKES A BAD JOKE",
    "ME TRYING TO LOOK PROFESSIONAL",
    "FAKE SMILE ACTIVATED",
    "INTERNAL SCREAMING",
    "REGRETTING LIFE DECISIONS",
    "PRETENDING TO UNDERSTAND"
  ],
  objects: [
    "THE CAUSE OF AND SOLUTION TO\\nALL LIFE'S PROBLEMS",
    "WHEN IT HITS JUST RIGHT",
    "THIS COULD SAVE YOUR LIFE",
    "AVERAGE ENJOYER",
    "IT'S NOT MUCH\\nBUT IT'S HONEST WORK",
    "INVESTMENT OF THE CENTURY",
    "PEAK ACQUISITION",
    "MUST HAVE THIS",
    "LIFE HACK UNLOCKED",
    "BIG BRAIN MOMENT",
    "ESSENTIAL TOOL",
    "GAME CHANGER"
  ],
  scenes: [
    "THIS COULD BE US\\nBUT YOU'RE BUSY",
    "TOUCH GRASS, THEY SAID\\nIT'LL BE FUN, THEY SAID",
    "NATURE IS HEALING",
    "AVERAGE OUTDOOR EXPERIENCE",
    "THE VIBE I'M GOING FOR",
    "PEACE WAS NEVER AN OPTION",
    "POV: YOU FOUND PARADISE",
    "SERENITY MODE ACTIVATED",
    "INSTAGRAM VS REALITY",
    "AESTHETICS 100",
    "GOALS UNLOCKED",
    "DREAM LOCATION"
  ],
  generic: [
    "SAME ENERGY",
    "IT SEEMED LIKE A GOOD IDEA\\nAT THE TIME",
    "NO REGRETS\\n(MANY REGRETS)",
    "I'M SOMETHING OF A\\nSCIENTIST MYSELF",
    "MODERN PROBLEMS REQUIRE\\nMODERN SOLUTIONS",
    "BUSINESS IS BOOMIN'",
    "VIBES ONLY",
    "LET'S NORMALIZE THIS",
    "MAIN CHARACTER ENERGY",
    "CERTIFIED LEGEND",
    "LIVING IN 3025",
    "UNLOCKED ACHIEVEMENT"
  ]
};

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
  setupEventListeners();
});

function setupEventListeners() {
  const uploadZone = document.getElementById('uploadZone');
  const imageInput = document.getElementById('imageInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const clearBtn = document.getElementById('clearBtn');
  const updateMemeBtn = document.getElementById('updateMemeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const createAnotherBtn = document.getElementById('createAnotherBtn');

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  });

  uploadZone.addEventListener('click', () => {
    imageInput.click();
  });

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  });

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', analyzeImage);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', resetApp);
  }

  if (updateMemeBtn) {
    updateMemeBtn.addEventListener('click', updateMemePreview);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadMeme);
  }

  if (createAnotherBtn) {
    createAnotherBtn.addEventListener('click', resetApp);
  }

  // Editor controls
  const textPositionEl = document.getElementById('textPosition');
  if (textPositionEl) {
    textPositionEl.addEventListener('change', (e) => {
      textPosition = e.target.value;
      if (livePreview) updateMemePreview();
    });
  }

  // Stroke width slider
  const strokeWidthEl = document.getElementById('strokeWidth');
  if (strokeWidthEl) {
    strokeWidthEl.addEventListener('input', (e) => {
      strokeWidth = parseFloat(e.target.value);
      document.getElementById('strokeWidthValue').textContent = strokeWidth.toFixed(1);
      if (livePreview) updateMemePreview();
    });
  }

  // Line spacing slider
  const lineSpacingEl = document.getElementById('lineSpacing');
  if (lineSpacingEl) {
    lineSpacingEl.addEventListener('input', (e) => {
      lineSpacing = parseFloat(e.target.value);
      document.getElementById('lineSpacingValue').textContent = lineSpacing.toFixed(1);
      if (livePreview) updateMemePreview();
    });
  }

  // Alignment control
  const textAlignEl = document.getElementById('textAlign');
  if (textAlignEl) {
    textAlignEl.addEventListener('change', (e) => {
      textAlign = e.target.value;
      if (livePreview) updateMemePreview();
    });
  }

  const fontSizeEl = document.getElementById('fontSize');
  if (fontSizeEl) {
    fontSizeEl.addEventListener('input', (e) => {
      fontSize = parseInt(e.target.value);
      document.getElementById('fontSizeValue').textContent = fontSize;
      if (livePreview) updateMemePreview();
    });
  }

  const fontStyleEl = document.getElementById('fontStyle');
  if (fontStyleEl) {
    fontStyleEl.addEventListener('change', (e) => {
      fontStyle = e.target.value;
      if (livePreview) updateMemePreview();
    });
  }

  const captionTextEl = document.getElementById('captionText');
  if (captionTextEl) {
    captionTextEl.addEventListener('input', (e) => {
      currentCaption = e.target.value;
      if (livePreview) updateMemePreview();
    });
  }

  // Color buttons
  document.querySelectorAll('.color-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.color-btn').forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
      textColor = this.dataset.color;
      if (livePreview) updateMemePreview();
    });
  });

  // Live Preview toggle
  let livePreview = true;

  const livePreviewEl = document.getElementById('livePreview');
  if (livePreviewEl) {
    livePreviewEl.addEventListener('change', (e) => {
      livePreview = e.target.checked;
    });
  }
}

function handleImageUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      uploadedImage = img;
      const uploadedImageEl = document.getElementById('uploadedImage');
      uploadedImageEl.src = e.target.result;

      document.getElementById('uploadZone').style.display = 'none';
      document.getElementById('previewContainer').style.display = 'block';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function analyzeImage() {
  const analysisSection = document.getElementById('analysisSection');
  const analysisLoading = document.getElementById('analysisLoading');
  const analysisResults = document.getElementById('analysisResults');

  analysisSection.style.display = 'block';
  analysisLoading.style.display = 'block';
  analysisResults.style.display = 'none';

  const statusTexts = [
    'Detecting objects...',
    'Analyzing scene...',
    'Understanding context...',
    'Generating insights...'
  ];

  let statusIndex = 0;
  const statusInterval = setInterval(() => {
    document.getElementById('analysisStatus').textContent = statusTexts[statusIndex];
    statusIndex++;
    if (statusIndex >= statusTexts.length) {
      clearInterval(statusInterval);
    }
  }, 800);

  setTimeout(() => {
    performAdvancedAnalysis();
    analysisLoading.style.display = 'none';
    analysisResults.style.display = 'block';
    generateUniqueCapions();
  }, 3000);
}

function performAdvancedAnalysis() {
  if (!uploadedImage) return;

  const canvas = document.createElement('canvas');
  canvas.width = uploadedImage.width;
  canvas.height = uploadedImage.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(uploadedImage, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let totalBrightness = 0;
  let colorProfile = { r: 0, g: 0, b: 0 };

  for (let i = 0; i < data.length; i += 40) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    colorProfile.r += r;
    colorProfile.g += g;
    colorProfile.b += b;
    totalBrightness += (r + g + b) / 3;
  }

  const pixelSamples = data.length / 40;
  colorProfile.r = Math.round(colorProfile.r / pixelSamples);
  colorProfile.g = Math.round(colorProfile.g / pixelSamples);
  colorProfile.b = Math.round(colorProfile.b / pixelSamples);
  const avgBrightness = totalBrightness / pixelSamples;

  const aspectRatio = uploadedImage.width / uploadedImage.height;
  const isPortrait = aspectRatio < 0.9;
  const isLandscape = aspectRatio > 1.1;
  const isSquare = !isPortrait && !isLandscape;

  const isDark = avgBrightness < 85;
  const isBright = avgBrightness > 170;

  const isDominantlyRed =
    colorProfile.r > colorProfile.g && colorProfile.r > colorProfile.b;
  const isDominantlyGreen =
    colorProfile.g > colorProfile.r && colorProfile.g > colorProfile.b;
  const isDominantlyBlue =
    colorProfile.b > colorProfile.r && colorProfile.b > colorProfile.g;

  detectedTags = [];

  if (isPortrait) detectedTags.push('Portrait');
  if (isLandscape) detectedTags.push('Landscape');
  if (isSquare) detectedTags.push('Square Format');

  if (isDark) detectedTags.push('Dark');
  if (isBright) detectedTags.push('Bright');

  if (isDominantlyRed) detectedTags.push('Warm Tones');
  if (isDominantlyBlue) detectedTags.push('Cool Tones');
  if (isDominantlyGreen) detectedTags.push('Nature Colors');

  const contexts = [
    'Person',
    'Object',
    'Animal',
    'Scene',
    'Detail',
    'Action',
  ];
  detectedTags.push(
    contexts[Math.floor(Math.random() * contexts.length)]
  );

  const tagsContainer = document.getElementById('tagsContainer');
  tagsContainer.innerHTML = detectedTags
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join('');
}

function generateUniqueCapions() {
  let category = 'generic';
  const tagString = detectedTags.join(' ').toLowerCase();

  if (tagString.includes('portrait')) {
    category = 'people';
  } else if (tagString.includes('landscape') || tagString.includes('nature')) {
    category = 'scenes';
  } else if (tagString.includes('warm') || tagString.includes('object')) {
    category = 'objects';
  } else if (tagString.includes('cool') || tagString.includes('dark')) {
    category = 'animals';
  }

  const captionsSection = document.getElementById('captionsSection');
  const captionsGrid = document.getElementById('captionsGrid');

  let availableCaptions = [...captionDatabase[category]];

  if (category !== 'generic') {
    availableCaptions.push(...captionDatabase.generic.slice(0, 3));
  }

  availableCaptions = availableCaptions.sort(() => 0.5 - Math.random());

  const selectedCaptions = [];
  for (let caption of availableCaptions) {
    if (
      !usedCaptions.includes(caption) &&
      selectedCaptions.length < 6
    ) {
      selectedCaptions.push(caption);
    }
  }

  if (selectedCaptions.length < 6) {
    for (let caption of availableCaptions) {
      if (
        selectedCaptions.length < 6 &&
        !selectedCaptions.includes(caption)
      ) {
        selectedCaptions.push(caption);
      }
    }
  }

  usedCaptions = [...selectedCaptions];

  const humorTypes = [
    'Relatable',
    'Sarcastic',
    'Wholesome',
    'Absurd',
    'Situational',
    'Pop Culture',
  ];

  captionsGrid.innerHTML = selectedCaptions
    .map((caption, index) => `
      <div class="caption-card" data-caption="${caption
        .replace(/"/g, '&quot;')}">
        <span class="humor-type">${
          humorTypes[index % humorTypes.length]
        }</span>
        <div class="caption-text">${caption}</div>
      </div>
    `)
    .join('');

  document.querySelectorAll('.caption-card').forEach((card) => {
    card.addEventListener('click', function () {
      const captionText = this.getAttribute('data-caption');
      selectCaption(captionText, this);
    });
  });

  captionsSection.style.display = 'block';
}

function selectCaption(text, element) {
  document.querySelectorAll('.caption-card').forEach((card) => {
    card.classList.remove('selected');
  });

  element.classList.add('selected');

  currentCaption = text;
  document.getElementById('captionText').value = text;
  document.getElementById('editorSection').style.display = 'grid';

  document.getElementById('editorSection').scrollIntoView({
    behavior: 'smooth',
  });

  updateMemePreview();
}

function updateMemePreview() {
  if (!uploadedImage) return;

  const canvas = document.getElementById('memeCanvas');
  const ctx = canvas.getContext('2d');

  const maxWidth = 800;
  const maxHeight = 600;
  let width = uploadedImage.width;
  let height = uploadedImage.height;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = width * ratio;
    height = height * ratio;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(uploadedImage, 0, 0, width, height);

  const captionText = document.getElementById('captionText').value;
  renderCaptionText(ctx, width, height, captionText);
}

function renderCaptionText(ctx, width, height, caption) {
  if (!caption) return;

  ctx.fillStyle = textColor;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = strokeWidth;
  ctx.font = `bold ${fontSize}px ${fontStyle}, Impact, Arial Black, sans-serif`;
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'top';

  const lines = caption.split('\\\\n');     // matches \\n in captionDatabase
  const lineHeight = fontSize * lineSpacing;
  const padding = 20;

  if (textPosition === 'top' || textPosition === 'both') {
    lines.forEach((line, index) => {
      const y = padding + (index * lineHeight);
      ctx.strokeText(line.toUpperCase(), width / 2, y);
      ctx.fillText(line.toUpperCase(), width / 2, y);
    });
  }

  if (textPosition === 'bottom' || textPosition === 'both') {
    const startY = height - padding - (lines.length * lineHeight);
    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      ctx.strokeText(line.toUpperCase(), width / 2, y);
      ctx.fillText(line.toUpperCase(), width / 2, y);
    });
  }

  if (textPosition === 'center') {
    const startY = (height - lines.length * lineHeight) / 2;
    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      ctx.strokeText(line.toUpperCase(), width / 2, y);
      ctx.fillText(line.toUpperCase(), width / 2, y);
    });
  }
}

function downloadMeme() {
  const canvas = document.getElementById('memeCanvas');
  const link = document.createElement('a');
  link.download = 'meme-' + Date.now() + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function resetApp() {
  uploadedImage = null;
  currentCaption = '';
  detectedTags = [];
  usedCaptions = [];

  // Reset editor values
  textColor = '#FFFFFF';
  fontSize = 40;
  textPosition = 'top';
  fontStyle = 'Impact';
  strokeWidth = 4;
  lineSpacing = 1.2;
  textAlign = 'center';

  document.getElementById('uploadZone').style.display = 'block';
  document.getElementById('previewContainer').style.display = 'none';
  document.getElementById('analysisSection').style.display = 'none';
  document.getElementById('captionsSection').style.display = 'none';
  document.getElementById('editorSection').style.display = 'none';
}
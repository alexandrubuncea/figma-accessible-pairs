//Open up UI

// figma.showUI(__html__);

// This plugin documents all the accessible color pairs in a library.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs such as the network by creating a UI which contains
// a full browser environment (see documentation).

// Get an array of all the paint styles in the file
const paintStyles = figma.getLocalPaintStyles();

// Get the names of the paint styles
const styleNames = paintStyles.map((style) => style.name);

//Load fonts

// Create a frame to contain the information
const frame = figma.createFrame();

frame.x = 0;
frame.y = 0;

figma.currentPage.appendChild(frame);

frame.name = "Accessible Pairs";
frame.layoutMode = "VERTICAL";
frame.verticalPadding = 24;
frame.horizontalPadding = 24;
frame.cornerRadius = 24;
frame.itemSpacing = 24;
frame.primaryAxisSizingMode = "AUTO";
frame.counterAxisSizingMode = "AUTO";

//Function to normalise RGB Values
function getRGB({ r, g, b }) {
  const rgbColorArray = [r, g, b].map((channel) => Math.round(channel * 255));
  return rgbColorArray;
}

// Use this formula to calculate luminance https://www.w3.org/WAI/GL/wiki/Relative_luminance
function calculateLuminance(color) {
  const normalizedColor = color.map((channel) => channel / 255);
  const gammaCorrectedRGB = normalizedColor.map((channel) =>
    channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4)
  );
  const luminance =
    gammaCorrectedRGB[0] * 0.2126 +
    gammaCorrectedRGB[1] * 0.7152 +
    gammaCorrectedRGB[2] * 0.0722;
  return luminance;
}

//Calculating contrast
function calculateContrast(first, second) {
  const firstLuminance = calculateLuminance(first) + 0.05;
  const secondLuminance = calculateLuminance(second) + 0.05;
  let contrast = firstLuminance / secondLuminance;

  if (secondLuminance > firstLuminance) {
    contrast = 1 / contrast;
  }

  // round to two decimal places
  contrast = Math.floor(contrast * 100) / 100;
  return contrast;
}

// Iterate over the color styles and pair them together

for (const paintStyle1 of paintStyles) {
  const paint1 = paintStyle1.paints[0];
  for (const paintStyle2 of paintStyles) {
    const paint2 = paintStyle2.paints[0];

    // Use just solid colors without transparency
    if (
      paint1.type === "SOLID" &&
      paint1.opacity === 1 &&
      paint2.type === "SOLID" &&
      paint2.opacity === 1
    ) {
      // Defines the fills
      const fill1 = paint1.color;
      const fill2 = paint2.color;

      //Get the RGB values of the pair
      const color1 = getRGB(fill1);
      const color2 = getRGB(fill2);

      //check contrast
      const contrastScore = calculateContrast(color1, color2);
      const contrastScoreString = contrastScore.toString();

      if (contrastScore >= 3) {
        // Color pair meets contrast requirements

        // Creates the first ellipse
        const ellipse1 = figma.createEllipse();
        ellipse1.name = "Color";
        ellipse1.fills = [{ type: "SOLID", color: fill1 }];
        ellipse1.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
        ellipse1.strokeWeight = 2;
        ellipse1.resize(24, 24);

        //Creates the second ellipse
        const ellipse2 = figma.createEllipse();
        ellipse2.name = "Color";
        ellipse2.fills = [{ type: "SOLID", color: fill2 }];
        ellipse2.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
        ellipse2.strokeWeight = 2;
        ellipse2.resize(24, 24);
        // Creates label
        // const loadFont = async () => {
        //   await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        // };

        // let label;

        // loadFont().then(() => {
        //   label = figma.createText();
        //   label.name = "Contrast Ratio";
        //   label.fontName = { family: "Inter", style: "Regular" };
        //   label.characters = contrastScoreString;
        //   label.fontSize = 12;
        //   label.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
        // });

        // (async () => {
        //   const text = figma.createText();

        //   // Load the font in the text node before setting the characters
        //   await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        //   text.characters = "Hello world!";

        //   // Set bigger font size and red color
        //   text.fontSize = 18;
        //   text.fills = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
        //   console.log(text);
        // })();

        //Creates the autolayout for the pair
        const pairFrame = figma.createFrame();
        pairFrame.appendChild(ellipse1);
        pairFrame.appendChild(ellipse2);
        // pairFrame.appendChild(text);

        pairFrame.name = "Pair";
        pairFrame.layoutMode = "HORIZONTAL";
        pairFrame.itemSpacing = -4;
        pairFrame.primaryAxisSizingMode = "AUTO";
        pairFrame.counterAxisSizingMode = "AUTO";

        frame.appendChild(pairFrame);
      }
    }
  }
}

figma.notify("Generated accessible pairs! 🎉");

// console.log(styleNames); // Outputs an array of color style objects
// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin();

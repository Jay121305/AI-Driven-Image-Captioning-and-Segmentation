import { GoogleGenAI, Modality } from '@google/genai';
import { Box } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as Data URL."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  
  const base64EncodedData = await base64EncodedDataPromise;
  
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const generateRegionAnalysis = async (
  imageFile: File, 
  box: Box,
  imageDimensions: { width: number, height: number }
) => {
  const imagePart = await fileToGenerativePart(imageFile);

  // Round coordinates to integers
  const x1 = Math.round(box.x1);
  const y1 = Math.round(box.y1);
  const x2 = Math.round(box.x2);
  const y2 = Math.round(box.y2);

  const captionPrompt = `Generate a detailed, descriptive caption for the primary object located inside the bounding box with top-left corner at (${x1}, ${y1}) and bottom-right corner at (${x2}, ${y2}).`;
  const segmentationPrompt = `I have an image with dimensions ${imageDimensions.width}x${imageDimensions.height} pixels. Perform instance segmentation on the object located inside the bounding box with top-left corner at (${x1}, ${y1}) and bottom-right corner at (${x2}, ${y2}). Generate a new image of the same dimensions, showing only the segmented object on a transparent background.`;

  // Promise for Captioning
  const captionPromise = ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { 
      parts: [
        imagePart, 
        { text: captionPrompt }
      ] 
    },
  });

  // Promise for Segmentation
  const segmentationPromise = ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        imagePart,
        { text: segmentationPrompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  const [captionResponse, segmentationResponse] = await Promise.all([captionPromise, segmentationPromise]);

  const caption = captionResponse.text;

  let segmentedImageUrl: string | null = null;
  const segmentationParts = segmentationResponse.candidates?.[0]?.content?.parts;
  if (segmentationParts) {
    for (const part of segmentationParts) {
      if (part.inlineData) {
        const base64ImageBytes = part.inlineData.data;
        segmentedImageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        break;
      }
    }
  }

  if (!caption) {
    throw new Error('Failed to generate caption.');
  }
  if (!segmentedImageUrl) {
    throw new Error('Failed to generate segmented image. The model may not have returned an image.');
  }

  return { caption, segmentedImageUrl };
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following English text to ${targetLanguage}: "${text}"`,
    });
    return response.text;
};
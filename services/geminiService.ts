import { GoogleGenAI, Type } from "@google/genai";
import type { Article, SocialPost, Platform } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// A helper to parse complex API errors and return a user-friendly message.
const getApiErrorMessage = (e: unknown, serviceName: string): string => {
    console.error(`${serviceName} failed:`, e);

    if (e instanceof Error) {
        // Case 1: Error message is a JSON string (like the 429 quota error)
        try {
            const errorJson = JSON.parse(e.message);
            if (errorJson?.error?.message) {
                if (errorJson.error.status === 'RESOURCE_EXHAUSTED') {
                    return `${serviceName} failed due to API quota limits. Please check your plan and billing details.`;
                }
                return `${serviceName} failed: ${errorJson.error.message}`;
            }
        } catch (jsonParseError) {
            // Not a JSON message, it's a standard error.
        }

        // Case 2: Standard error message (e.g., from our own `throw new Error(...)`)
        return e.message;
    }

    // Case 3: Fallback for non-Error objects or other types
    return `An unknown error occurred during ${serviceName}.`;
};


const articleGenerationPrompt = (url: string, language: string, seoKeywords: string) => {
    const keywordInstruction = seoKeywords.trim() ? `
**SEO Keyword Integration:**
You have been provided with the following list of SEO keywords: "${seoKeywords}".
*   **Headline:** At least one of the primary keywords must be naturally integrated into the headline.
*   **Article Body:** Weave these keywords naturally throughout the article content, especially in subheadings and the first few paragraphs. Do not "keyword stuff". The integration must feel organic and relevant to the context. Aim for a sensible keyword density.
` : '';

    return `
**Persona:**
Assume the persona of a seasoned, witty journalist for a top-tier online publication known for its sharp, insightful tech and culture commentary. You are writing an in-depth feature article, not a dry news report. Your goal is to inform, engage, and make the reader think.

**Primary Task:**
Write a 100% original, deeply researched, and highly engaging news article in ${language}. The article's foundation is the content from this URL: ${url}. You must synthesize the information, not just rephrase it, and build a compelling new narrative.
${keywordInstruction}
**Article Structure & Content Guidelines:**
1.  **Captivating Headline:** Create a headline that is intriguing and informative but avoids cheap clickbait.
2.  **Hooking Introduction (1-2 paragraphs):** Start with a powerful hook—a surprising fact, a relatable anecdote, or a provocative question that grabs the reader's attention immediately. Set the scene and state why this topic is important right now.
3.  **Main Body (Multiple Sections):**
    *   Break the core story into logical sections using clear, compelling subheadings (Markdown: '## Subheading').
    *   For each section, go beyond surface-level facts. Explain the 'why' and 'how'.
    *   Incorporate different perspectives. If there are debates or opposing views, present them. Use phrases like "On one hand..." or "Critics, however, point out...".
    *   Weave in a human element. Use illustrative examples, or synthesized quotes (e.g., "according to one industry insider," or "as one user on a forum aptly put it,") to make the story more relatable.
4.  **Insight & Analysis (1-2 paragraphs):** This is crucial. What are the broader implications of this news? What does it mean for the industry, for society, for the reader? Connect the dots and offer a unique perspective.
5.  **Forward-Looking Conclusion (1 paragraph):** Do not just summarize. End with a thought-provoking statement, a question about the future, or a final, powerful insight that leaves a lasting impression on the reader.

**Style & Tone Requirements:**
*   **Language:** The entire output must be in ${language}.
*   **Voice:** Authoritative, intelligent, and conversational with a touch of wit. Write like a smart, interesting person speaks.
*   **Sentence Fluency:** Vary your sentence structure. Use a mix of short, punchy statements and longer, more descriptive sentences to create a dynamic reading rhythm.
*   **Vivid Language:** Use strong verbs, metaphors, and clear analogies to explain complex ideas.
*   **STRICTLY AVOID:**
    *   AI clichés ("In today's fast-paced world...", "As we delve deeper...", "The landscape is ever-evolving...").
    *   Robotic, overly formal, or academic language.
    *   Jargon without explanation.
    *   Emojis or hyperlinks.
*   **Length:** Aim for a comprehensive feature piece, around 1200–1800 words.

**Output Format:**
Return a single, valid JSON object with the exact keys: "title", "imagePrompt", "videoPrompt", and "articleContent". Ensure the "articleContent" value contains the full article formatted with Markdown subheadings.
`;
};

const articleSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: 'A clickbait yet professional title.',
        },
        imagePrompt: {
            type: Type.STRING,
            description: "Create a safe-for-work (SFW), high-quality, photorealistic 16:9 feature image prompt. The prompt must be purely descriptive of a visual scene, avoiding any names, controversial topics, or ambiguous terms that could be misinterpreted. Focus on creating a visually appealing, generic, and universally acceptable image. Do not ask for any text to be rendered in the image.",
        },
        videoPrompt: {
            type: Type.STRING,
            description: "Generate a highly descriptive, scene-by-scene prompt for a 15-30 second video summarizing the article. The prompt must be a single string. It should specify: \n1. **Overall Tone:** (e.g., 'inspirational and hopeful', 'urgent and informative', 'sleek and futuristic'). \n2. **Key Visuals & Cinematography:** For several short scenes, describe specific, dynamic imagery based on the article. For each scene, specify **camera angles** (e.g., 'dramatic wide shot', 'intense close-up on a face', 'sweeping drone shot') and **scene transitions** (e.g., 'a quick cut to the next scene', 'a slow fade to black', 'a dynamic wipe effect'). Example: 'Scene 1: A wide shot of a bustling city skyline at dawn, followed by a quick cut to... Scene 2: A close-up of a scientist's hands working on a glowing device.' \n3. **Text Overlays:** Include specific, concise text to appear on screen for key statistics or powerful quotes. \n4. **Music Style:** Suggest a genre of royalty-free background music that matches the tone (e.g., 'Uplifting corporate electronic track,' 'Cinematic orchestral score'). \n5. **Call to Action:** End with a simple, engaging question or statement for the viewer (e.g., 'What do you think the future holds?', 'Read the full story to learn more.'). The entire output should be a single, coherent paragraph.",
        },
        articleContent: {
            type: Type.STRING,
            description: "The full news article (1000–1500 words) in the specified language, following all the rules, with subheadings prefixed by '##'.",
        },
    },
    required: ["title", "imagePrompt", "videoPrompt", "articleContent"],
};


export const generateArticleFromUrl = async (url: string, model: string, language: string, seoKeywords: string): Promise<Article> => {
    console.log(`Generating article for URL: ${url} with model: ${model} in language: ${language} using keywords: ${seoKeywords}`);
    
    let response;
    try {
        response = await ai.models.generateContent({
            model: model,
            contents: articleGenerationPrompt(url, language, seoKeywords),
            config: {
                responseMimeType: "application/json",
                responseSchema: articleSchema,
            },
        });
    } catch (e) {
        throw new Error(getApiErrorMessage(e, 'Article generation'));
    }

    const jsonText = response.text.trim();
    console.log("Article JSON response received:", jsonText);
    
    try {
        const parsedArticle = JSON.parse(jsonText);
        // Basic validation
        if (parsedArticle.title && parsedArticle.imagePrompt && parsedArticle.videoPrompt && parsedArticle.articleContent) {
            return parsedArticle as Article;
        } else {
            throw new Error("Parsed JSON is missing required article fields.");
        }
    } catch (e) {
         console.error("Failed to parse JSON response:", { jsonText, error: e });
        throw new Error("Failed to parse the structured article from the AI response. The format was unexpected.");
    }
};

export const generateFeatureImage = async (prompt: string): Promise<string> => {
    console.log("Generating image with prompt:", prompt);
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            console.error("Image generation API call succeeded but returned no images. This is often due to safety filters.", { prompt, response });
            throw new Error("The generated image prompt was blocked by safety filters. Try generating the article again to get a new prompt.");
        }
    } catch (e) {
        throw new Error(getApiErrorMessage(e, 'Image generation'));
    }
};

export const generateSocialPostImage = async (prompt: string): Promise<string> => {
    console.log("Generating social post image with prompt:", prompt);
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            console.error("Social image generation API call succeeded but returned no images.", { prompt, response });
            throw new Error("The image prompt was blocked or returned no content. Please try regenerating.");
        }
    } catch (e) {
        throw new Error(getApiErrorMessage(e, 'Social image generation'));
    }
};


const socialMediaPrompt = (articleContent: string) => `
Based on the following news article, create a series of SEO-optimized social media posts.

For each post, provide:
1. A compelling caption.
2. A list of relevant hashtags, with each hashtag STARTING WITH the '#' symbol.
3. A safe-for-work (SFW), purely descriptive prompt for a visually appealing, postcard-style square (1:1 aspect ratio) image. The prompt must avoid names, controversial topics, or ambiguous terms. Focus on creating a positive or neutral, generic, and universally acceptable image. Do not ask for any text to be rendered in the image.

Article:
---
${articleContent}
---

Generate posts for the following platforms: Facebook, Instagram, Twitter, and LinkedIn. Your output must be in JSON format.
`;

const socialPostSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            platform: { type: Type.STRING, enum: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn'], description: "The social media platform." },
            caption: { type: Type.STRING, description: "A compelling caption for the post." },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of relevant hashtags, each one starting with '#' ." },
            imagePrompt: { type: Type.STRING, description: "A detailed, SFW prompt for generating a postcard-style image, avoiding names, controversial topics, or ambiguous terms." }
        },
        required: ["platform", "caption", "hashtags", "imagePrompt"]
    }
};

export const generateSocialMediaPosts = async (articleContent: string): Promise<SocialPost[]> => {
    console.log("Generating social media posts...");
    
    let response;
    try {
        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: socialMediaPrompt(articleContent),
            config: {
                responseMimeType: "application/json",
                responseSchema: socialPostSchema
            },
        });
    } catch (e) {
        throw new Error(getApiErrorMessage(e, 'Social post generation'));
    }

    const jsonText = response.text.trim();
    console.log("Social posts JSON received:", jsonText);
    const parsed = JSON.parse(jsonText);
    // The enum type from the schema is just a string, so we need to cast it.
    return parsed.map((post: any) => ({ ...post, platform: post.platform as Platform })) as SocialPost[];
};


export const generateArticleVideo = async (prompt: string, onProgress: (message: string) => void): Promise<string> => {
    console.log("Generating video with prompt:", prompt);
    onProgress("Initializing video render...");
    
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
            }
        });

        onProgress("Rendering video... (this may take a few minutes)");
        
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        onProgress("Finalizing video...");

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation succeeded but no download link was returned.");
        }

        onProgress("Fetching video data...");
        
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to download video file. Status: ${response.status}`);
        }
        
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        
        onProgress("Video generation complete!");
        return videoUrl;

    } catch(e) {
        throw new Error(getApiErrorMessage(e, 'Video generation'));
    }
};
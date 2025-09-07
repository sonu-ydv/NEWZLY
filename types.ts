export interface Article {
  title: string;
  imagePrompt: string;
  videoPrompt: string;
  articleContent: string;
}

export enum Platform {
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  Twitter = 'Twitter',
  LinkedIn = 'LinkedIn',
}

export interface SocialPost {
  platform: Platform;
  caption: string;
  hashtags: string[];
  imagePrompt: string;
}

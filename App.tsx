import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlInputForm } from './components/UrlInputForm';
import { GenerationOptions } from './components/GenerationOptions';
import { ArticleDisplay } from './components/ArticleDisplay';
import { SocialMediaPosts } from './components/SocialMediaPosts';
import { Loader } from './components/Loader';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Modal } from './components/Modal';
import { VStudio } from './components/VideoStudio';
import { Homepage } from './components/Homepage';
import { Footer } from './components/Footer';
import { generateArticleFromUrl, generateFeatureImage, generateSocialMediaPosts } from './services/geminiService';
import type { Article, SocialPost } from './types';

type LoadingStep = {
    text: string;
    status: 'pending' | 'active' | 'done';
}

type ActiveView = 'homepage' | 'nstudio' | 'vstudio';
type ModalType = 'privacy' | 'contact' | 'about' | 'terms';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([]);
  const [isSocialLoading, setIsSocialLoading] = useState<boolean>(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [featureImage, setFeatureImage] = useState<string | null>(null);
  const [socialPosts, setSocialPosts] = useState<SocialPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [language, setLanguage] = useState<string>('English');
  const [seoKeywords, setSeoKeywords] = useState<string>('');
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('homepage');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
        const storedTheme = localStorage.getItem('newzly-theme');
        if (storedTheme) {
            return storedTheme as 'light' | 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
        return 'light'; // Default to light theme if any error occurs
    }
  });

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
        root.classList.remove('dark');
    } else {
        root.classList.add('dark');
    }
    try {
        localStorage.setItem('newzly-theme', theme);
    } catch (e) {
        console.error("Failed to save theme to localStorage", e);
    }
  }, [theme]);

  // SEO Meta Tags Effect
  useEffect(() => {
    const defaultTitle = 'NEWZLY - AI News Writer & Video Creator';
    const defaultDescription = 'An AI-powered platform to generate professional, human-like news articles from a URL and create stunning summary videos.';
    const metaDescriptionTag = document.querySelector('meta[name="description"]');

    if (activeView === 'nstudio' && article) {
        document.title = `${article.title} | NEWZLY`;
        if (metaDescriptionTag) {
            const firstParagraph = article.articleContent.split('\n').find(p => p.trim().length > 0) || '';
            const snippet = firstParagraph.substring(0, 160).trim();
            const description = snippet.length >= 160 ? `${snippet}...` : snippet;
            metaDescriptionTag.setAttribute('content', description);
        }
    } else if (activeView === 'nstudio') {
        document.title = `N'Studio | NEWZLY`;
        if (metaDescriptionTag) {
            metaDescriptionTag.setAttribute('content', 'Generate unique, human-like news articles from any URL with the NEWZLY AI N\'Studio.');
        }
    } else if (activeView === 'vstudio') {
        document.title = `V'Studio | NEWZLY`;
        if (metaDescriptionTag) {
            metaDescriptionTag.setAttribute('content', 'Generate compelling summary videos from any text prompt using the NEWZLY AI V\'Studio.');
        }
    } else {
        document.title = defaultTitle;
        if (metaDescriptionTag) {
            metaDescriptionTag.setAttribute('content', defaultDescription);
        }
    }
  }, [article, activeView]);

  const toggleTheme = () => {
      setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Load from localStorage on initial render
  useEffect(() => {
    try {
      const savedArticle = localStorage.getItem('newzly-article');
      const savedImage = localStorage.getItem('newzly-feature-image');
      const savedSocialPosts = localStorage.getItem('newzly-social-posts');

      if (savedArticle) setArticle(JSON.parse(savedArticle));
      if (savedImage) setFeatureImage(savedImage);
      if (savedSocialPosts) setSocialPosts(JSON.parse(savedSocialPosts));
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
      localStorage.clear();
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (article) localStorage.setItem('newzly-article', JSON.stringify(article));
    else localStorage.removeItem('newzly-article');
  }, [article]);

  useEffect(() => {
    if (featureImage) localStorage.setItem('newzly-feature-image', featureImage);
    else localStorage.removeItem('newzly-feature-image');
  }, [featureImage]);

  useEffect(() => {
    if (socialPosts) localStorage.setItem('newzly-social-posts', JSON.stringify(socialPosts));
    else localStorage.removeItem('newzly-social-posts');
  }, [socialPosts]);


  const handleArticleGeneration = useCallback(async (url: string) => {
    if (!url) {
      setError('Please enter a valid URL.');
      return;
    }
    handleClear();
    setError(null);
    setIsLoading(true);

    const initialSteps: LoadingStep[] = [
        { text: 'Analyzing URL and crafting article...', status: 'active' },
        { text: 'Generating feature image...', status: 'pending' },
        { text: 'Finalizing content...', status: 'pending' },
    ];
    setLoadingSteps(initialSteps);

    try {
      const generatedArticle = await generateArticleFromUrl(url, model, language, seoKeywords);
      setArticle(generatedArticle);
      setLoadingSteps(prev => prev.map((s, i) => i === 0 ? {...s, status: 'done'} : (i === 1 ? {...s, status: 'active'} : s)));

      const image = await generateFeatureImage(generatedArticle.imagePrompt);
      setFeatureImage(image);
      setLoadingSteps(prev => prev.map((s, i) => i <= 1 ? {...s, status: 'done'} : (i === 2 ? {...s, status: 'active'} : s)));

      setLoadingSteps(prev => prev.map(s => ({...s, status: 'done'})));
      
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate the article. ${errorMessage}`);
      setLoadingSteps([]);
    } finally {
      setIsLoading(false);
    }
  }, [model, language, seoKeywords]);

  const handleSocialPostGeneration = useCallback(async () => {
    if (!article) return;
    setError(null);
    setIsSocialLoading(true);
    setSocialPosts(null);
    try {
      const posts = await generateSocialMediaPosts(article.articleContent);
      setSocialPosts(posts);
    } catch (e) {
      console.error(e);
      setError('Failed to generate social media posts. Please try again.');
    } finally {
      setIsSocialLoading(false);
    }
  }, [article]);

  const handleArticleUpdate = (updatedArticle: Article) => {
    setArticle(updatedArticle);
  };

  const handleClear = useCallback(() => {
      setArticle(null);
      setFeatureImage(null);
      setSocialPosts(null);
      setError(null);
      setLoadingSteps([]);
      setIsSocialLoading(false);
  }, []);

  const handleShowModal = (modal: ModalType) => {
    setActiveModal(modal);
  };

  const handleCloseModal = () => {
      setActiveModal(null);
  };

  const handleNavigate = (view: ActiveView) => {
    setActiveView(view);
    if (error && view !== 'nstudio') {
        setError(null);
    }
  };

  const getModalContent = () => {
    switch (activeModal) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          content: (
            <div className="space-y-4">
              <p>Your privacy is important to us. This policy explains what information we collect and how we use it.</p>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Information We Collect</h3>
              <p><strong>Article Content:</strong> The URL you provide is sent to the Gemini API to generate content. We do not store the URLs or the generated articles on our servers.</p>
              <p><strong>Local Storage:</strong> To enhance your experience, the generated article, feature image, and social media posts are saved in your browser's local storage. This allows you to resume your session later. This data is stored only on your device and is not transmitted to us.</p>
              <p><strong>Theme Preference:</strong> We save your preferred theme (light/dark) in local storage for a consistent experience across visits.</p>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Third-Party Services</h3>
              <p>This application uses the Google Gemini API to generate content. Your requests, including the content from the URLs you provide, are processed by Google. We recommend reviewing Google's privacy policy for more information on how they handle data.</p>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Data Security</h3>
              <p>Since we do not store your personal data on our servers, the primary security concern is the data stored locally on your device. You can clear this data at any time by clicking the "Start New" button or clearing your browser's cache.</p>
            </div>
          )
        };
      case 'contact':
        return {
          title: 'Contact Us',
          content: (
            <div className="space-y-4">
              <p>We'd love to hear from you! Whether you have a question about features, trials, or anything else, our team is ready to answer all your questions.</p>
              <p>For support, feedback, or inquiries, please reach out to us via email:</p>
              <a href="mailto:support@newzly.app" className="text-cyan-500 hover:text-cyan-400 font-medium">support@newzly.app</a>
            </div>
          )
        };
      case 'about':
        return {
          title: 'About NEWZLY',
          content: (
            <div className="space-y-4">
                <p><strong>NEWZLY</strong> is a powerful AI-driven platform designed to revolutionize the way news articles and social media content are created. Our mission is to empower journalists, content creators, and marketing professionals by providing them with a tool that generates high-quality, human-like, and SEO-optimized content in a matter of seconds.</p>
                <p>In a fast-paced digital world, staying relevant and producing fresh content consistently is a challenge. NEWZLY bridges this gap by leveraging the cutting-edge capabilities of Google's Gemini API. Simply provide a link to an existing news article, and our AI will craft a completely new, plagiarism-free piece that maintains a natural, conversational tone.</p>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Key Features:</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Human-Like Article Generation:</strong> Creates articles that are indistinguishable from those written by experienced human journalists.</li>
                    <li><strong>Social Media Toolkit:</strong> Automatically generates optimized posts for various platforms, complete with engaging captions and relevant hashtags.</li>
                    <li><strong>Customization:</strong> Edit and refine all generated content to add your personal touch before publishing.</li>
                    <li><strong>Efficiency:</strong> Drastically reduces the time and effort required to produce high-quality content.</li>
                </ul>
                <p>We believe in the synergy of human creativity and artificial intelligence. NEWZLY isn't here to replace writers, but to be their most powerful assistant.</p>
            </div>
          )
        };
      case 'terms':
        return {
          title: 'Terms & Conditions',
          content: (
            <div className="space-y-4">
              <p>Welcome to NEWZLY. By using our application, you agree to these terms.</p>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Use of Service</h3>
              <p>NEWZLY provides an AI-powered content generation service. You are responsible for the content you generate and must ensure it complies with all applicable laws and does not infringe on any third-party rights. You agree not to use the service for generating harmful, illegal, or malicious content.</p>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Generated Content</h3>
              <p>The content generated by the AI is for your use, but we do not claim ownership or guarantee its accuracy, uniqueness, or suitability for any purpose. The responsibility for fact-checking and ensuring the appropriateness of the content lies with you, the user.</p>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">API Usage</h3>
              <p>The service relies on the Google Gemini API. Your use of NEWZLY is also subject to Google's API policies. Excessive or abusive usage may result in temporary or permanent suspension of access.</p>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Limitation of Liability</h3>
              <p>NEWZLY is provided "as is" without any warranties. We are not liable for any damages or losses resulting from your use of the application.</p>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Changes to Terms</h3>
              <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
            </div>
          )
        };
      default:
        return { title: '', content: null };
    }
  };

  const modalData = getModalContent();

  const renderStudio = () => {
    switch (activeView) {
        case 'nstudio':
            return (
                <>
                    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg dark:shadow-2xl border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
                      <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600">
                        N'Studio
                      </h2>
                      <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
                        Provide a news article link and let AI craft a unique, professional piece for you.
                      </p>
                      <UrlInputForm onSubmit={handleArticleGeneration} isLoading={isLoading} />
                      <GenerationOptions
                        model={model}
                        onModelChange={setModel}
                        language={language}
                        onLanguageChange={setLanguage}
                        seoKeywords={seoKeywords}
                        onSeoKeywordsChange={setSeoKeywords}
                        isLoading={isLoading}
                      />
                    </div>
                    
                    <div className="mt-8">
                        {error && <ErrorDisplay message={error} />}
                        
                        {isLoading && loadingSteps.length > 0 && (
                            <div className="max-w-4xl mx-auto">
                                <Loader steps={loadingSteps} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-8 mt-8">
                          <div className="lg:col-span-3">
                            {article && (
                              <ArticleDisplay
                                article={article}
                                onArticleUpdate={handleArticleUpdate}
                                featureImage={featureImage}
                                onGenerateSocial={handleSocialPostGeneration}
                                isSocialLoading={isSocialLoading}
                              />
                            )}
                          </div>
                          <div className="lg:col-span-2">
                            {isSocialLoading && (
                                <div className="mt-8 lg:mt-0 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg dark:shadow-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                                      <svg className="animate-spin h-10 w-10 text-purple-500 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <p className="text-lg text-slate-600 dark:text-slate-300">Optimizing posts for social media...</p>
                                    </div>
                                </div>
                            )}
                            {socialPosts && (
                              <SocialMediaPosts 
                                posts={socialPosts} 
                                onRegenerate={handleSocialPostGeneration}
                              />
                            )}
                          </div>
                        </div>
                    </div>
                </>
            );
        case 'vstudio':
            return <VStudio />;
        case 'homepage':
        default:
            return <Homepage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col">
      <Header 
        onClear={handleClear} 
        hasContent={!!article} 
        theme={theme}
        onToggleTheme={toggleTheme}
        onShowModal={handleShowModal}
        activeView={activeView}
        onNavigate={handleNavigate}
      />
      <main className="container mx-auto px-4 py-12 max-w-7xl flex-grow">
        {renderStudio()}
      </main>
      <Footer onNavigate={handleNavigate} onShowModal={handleShowModal} />
      {activeModal && (
        <Modal title={modalData.title} onClose={handleCloseModal}>
            {modalData.content}
        </Modal>
    )}
    </div>
  );
};

export default App;
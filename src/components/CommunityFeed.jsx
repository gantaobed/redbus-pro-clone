import { useState, useContext } from 'react';
import { AppContext } from '../App';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, ThumbsUp, MessageSquare, Flag } from 'lucide-react';

const i18n = {
  en: { title: 'Verified Traveler Reviews', post: 'Post Review', placeholder: 'Share your journey experience... (min 20 characters)', rules: 'Only verified users can post. Ratings cannot be changed after 24h.' },
  hi: { title: 'सत्यापित यात्री समीक्षाएं', post: 'समीक्षा पोस्ट करें', placeholder: 'अपनी यात्रा का अनुभव साझा करें... (कम से कम 20 अक्षर)', rules: 'केवल सत्यापित उपयोगकर्ता पोस्ट कर सकते हैं। 24 घंटे के बाद रेटिंग नहीं बदली जा सकती।' }
};

const initialPosts = [
  { id: 1, user: 'Alex Chen', verified: true, rating: 5, text: 'Absolutely fantastic journey from Seattle to Portland. The Wi-Fi actually worked the whole time and the seats were spacious.', upvotes: 24, time: '2h ago' },
  { id: 2, user: 'Maria Garcia', verified: true, rating: 4, text: 'Good trip overall, but we departed 15 minutes late. The driver was very professional and made up for lost time safely.', upvotes: 8, time: '5h ago' }
];

export default function CommunityFeed() {
  const { lang } = useContext(AppContext);
  const t = i18n[lang];
  
  const [posts, setPosts] = useState(initialPosts);
  const [newText, setNewText] = useState('');
  const [rating, setRating] = useState(5);

  const handlePost = () => {
    if (newText.length < 20) {
      alert(lang === 'en' ? 'Review must be at least 20 characters.' : 'समीक्षा कम से कम 20 अक्षरों की होनी चाहिए।');
      return;
    }
    const post = {
      id: Date.now(),
      user: 'You',
      verified: true,
      rating: rating,
      text: newText,
      upvotes: 0,
      time: 'Just now'
    };
    setPosts([post, ...posts]);
    setNewText('');
    setRating(5);
  };

  const handleUpvote = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Post Creation Area */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">{t.title}</h2>
        <div className="flex gap-2 mb-4">
          {[1,2,3,4,5].map(star => (
            <Star key={star} onClick={() => setRating(star)} className={`cursor-pointer ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} size={28} />
          ))}
        </div>
        <textarea 
          value={newText} onChange={(e) => setNewText(e.target.value)}
          placeholder={t.placeholder}
          className="w-full p-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500 resize-none h-32 transition"
        />
        <div className="mt-4 flex justify-between items-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><ShieldCheck size={14}/> {t.rules}</p>
          <button onClick={handlePost} className="bg-gray-900 dark:bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-black dark:hover:bg-red-700 transition">
            {t.post}
          </button>
        </div>
      </div>

      {/* Feed Area */}
      <div className="space-y-4">
        {posts.map((post) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={post.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-bold text-lg">
                  {post.user.charAt(0)}
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1">
                    {post.user} {post.verified && <ShieldCheck size={16} className="text-green-500" />}
                  </div>
                  <div className="text-xs text-gray-500">{post.time}</div>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < post.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-700'} />
                ))}
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{post.text}</p>
            
            <div className="flex gap-6 border-t dark:border-gray-700 pt-4">
              <button onClick={() => handleUpvote(post.id)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition">
                <ThumbsUp size={18} /> {post.upvotes} Helpful
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
                <MessageSquare size={18} /> Comment
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-500 ml-auto transition">
                <Flag size={18} /> Report
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
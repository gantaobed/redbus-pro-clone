import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, ThumbsUp, MessageSquare, Flag, Share2, Image as ImageIcon, Sparkles, Filter } from 'lucide-react';

export default function CommunityFeed() {
  const { lang } = useContext(AppContext);

  const [activeSubTab, setActiveSubTab] = useState('reviews'); // 'reviews' or 'forum'
  const [reviewsData, setReviewsData] = useState({ reviews: [], avgRating: "5.0" });
  const [posts, setPosts] = useState([]);
  const [topicFilter, setTopicFilter] = useState('All');

  // Review Form
  const [pnrInput, setPnrInput] = useState('RB-99812');
  const [routeInput, setRouteInput] = useState('New Delhi to Hyderabad');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Forum Form
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [postTopic, setPostTopic] = useState('Travel Advice');

  useEffect(() => {
    fetchReviews();
    fetchPosts();
  }, [topicFilter]);

  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reviews');
      const data = await res.json();
      if (data.reviews) setReviewsData(data);
    } catch (e) { console.error(e); }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/community/posts?topic=${topicFilter}`);
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (e) { console.error(e); }
  };

  const submitReview = async () => {
    if (reviewText.length < 20) return alert("Review must be at least 20 characters long.");
    try {
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: "Obed Ganta", pnr: pnrInput, route: routeInput, rating, text: reviewText })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Verified Journey Review Published!");
        setReviewText('');
        fetchReviews();
      } else {
        alert("Error: " + data.error);
      }
    } catch (e) { alert("Server error."); }
  };

  const submitForumPost = async () => {
    if (!postTitle || !postContent) return alert("Title and Content are required.");
    try {
      const res = await fetch('http://localhost:5000/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: "Obed Ganta", isVerified: true, topic: postTopic, title: postTitle, content: postContent, photoUrl })
      });
      if (res.ok) {
        alert("Post shared with community!");
        setPostTitle(''); setPostContent(''); setPhotoUrl('');
        fetchPosts();
      }
    } catch (e) { alert("Failed to post."); }
  };

  const handleLike = async (id) => {
    await fetch(`http://localhost:5000/api/community/posts/${id}/like`, { method: 'POST' });
    fetchPosts();
  };

  const handleReportPost = async (id) => {
    await fetch(`http://localhost:5000/api/community/posts/${id}/report`, { method: 'POST' });
    alert("Content reported for safety review.");
  };

  const handleSocialShare = (title) => {
    if (navigator.share) {
      navigator.share({ title: "RedBus Pro Travel Community", text: title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("External share link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Sub-Navigation Switcher */}
      <div className="flex justify-center border-b dark:border-gray-700 pb-4 gap-6">
        <button onClick={() => setActiveSubTab('reviews')} className={`text-lg font-bold pb-1 ${activeSubTab === 'reviews' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}>
          Task 6: Verified Journey Reviews (Avg ⭐ {reviewsData.avgRating})
        </button>
        <button onClick={() => setActiveSubTab('forum')} className={`text-lg font-bold pb-1 ${activeSubTab === 'forum' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}>
          Task 1: Traveler Stories & Discussion Boards
        </button>
      </div>

      {/* TASK 6 SECTION */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-green-600">
              <ShieldCheck /> Rate Your Completed Journey
            </h3>
            <p className="text-xs text-gray-400 mb-4">Feedback is strictly limited to verified travelers with completed PNRs.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input type="text" value={pnrInput} onChange={e => setPnrInput(e.target.value)} placeholder="Completed PNR Number" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none border" />
              <input type="text" value={routeInput} onChange={e => setRouteInput(e.target.value)} placeholder="Bus Route" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none border" />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-bold">Your Rating:</span>
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} onClick={() => setRating(star)} className={`cursor-pointer ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} size={24} />
              ))}
            </div>

            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Write your genuine travel experience (minimum 20 characters)..." className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border outline-none h-24 mb-4" />
            
            <button onClick={submitReview} className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition">
              Submit Verified Review
            </button>
          </div>

          <div className="space-y-4">
            {reviewsData.reviews.map(rev => (
              <div key={rev._id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold flex items-center gap-1">{rev.user} <ShieldCheck size={16} className="text-green-500" /></span>
                    <p className="text-xs text-gray-400">PNR: {rev.pnr} | Route: {rev.route}</p>
                  </div>
                  <div className="flex text-yellow-400 font-bold">⭐ {rev.rating}/5</div>
                </div>
                <p className="mt-3 text-gray-700 dark:text-gray-300">{rev.text}</p>
                <div className="mt-3 text-xs text-gray-400 flex justify-between">
                  <span>Editable within 24 hours of posting</span>
                  <button onClick={() => fetch(`http://localhost:5000/api/reviews/${rev._id}/report`, { method: 'POST' }).then(() => fetchReviews())} className="text-red-500 hover:underline flex items-center gap-1">
                    <Flag size={12} /> Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TASK 1 SECTION */}
      {activeSubTab === 'forum' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border dark:border-gray-700">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Sparkles className="text-red-600" /> Share Travel Story, Tips & Photos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input type="text" value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="Discussion Title" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none border" />
              <select value={postTopic} onChange={e => setPostTopic(e.target.value)} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none border">
                <option value="Routes">Routes Discussion</option>
                <option value="Destinations">Destinations Advice</option>
                <option value="Travel Advice">General Travel Tips</option>
              </select>
            </div>

            <textarea value={postContent} onChange={e => setPostContent(e.target.value)} placeholder="Write story or tip details..." className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border outline-none h-24 mb-4" />
            
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <input type="text" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="Cloud Image/Photo URL (e.g., https://images.unsplash.com/...)" className="w-full md:w-2/3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none border text-sm" />
              <button onClick={submitForumPost} className="w-full md:w-auto bg-gray-900 dark:bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-black transition">
                Publish Post
              </button>
            </div>
          </div>

          {/* Topic Board Filter */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Filter size={18} className="text-gray-400" />
            {['All', 'Routes', 'Destinations', 'Travel Advice'].map(topic => (
              <button key={topic} onClick={() => setTopicFilter(topic)} className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${topicFilter === topic ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {topic}
              </button>
            ))}
          </div>

          {/* Forum List */}
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 px-3 py-1 rounded-full">{post.topic}</span>
                  <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <h4 className="text-xl font-bold mb-2">{post.title}</h4>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>

                {post.photoUrl && (
                  <img src={post.photoUrl} alt="Travel Photo" className="w-full h-64 object-cover rounded-xl mb-4 border dark:border-gray-700" />
                )}

                <div className="flex justify-between items-center border-t dark:border-gray-700 pt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-6">
                    <button onClick={() => handleLike(post._id)} className="flex items-center gap-1 hover:text-red-600 font-bold">
                      <ThumbsUp size={18} /> {post.likes} Likes
                    </button>
                    <button onClick={() => handleSocialShare(post.title)} className="flex items-center gap-1 hover:text-blue-600 font-bold">
                      <Share2 size={18} /> Social Share
                    </button>
                  </div>
                  <button onClick={() => handleReportPost(post._id)} className="text-red-500 hover:underline flex items-center gap-1">
                    <Flag size={14} /> Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
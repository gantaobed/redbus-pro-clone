import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { Star, ShieldCheck, ThumbsUp, Sparkles, Edit2, UploadCloud, MessageCircle, Share2, Award } from 'lucide-react';

export default function CommunityFeed() {
  const { t } = useContext(AppContext);
  const [activeSubTab, setActiveSubTab] = useState('reviews');
  const [reviewsData, setReviewsData] = useState({ reviews: [], avgRating: "5.0" });
  const [posts, setPosts] = useState([]);
  
  const [pnrInput, setPnrInput] = useState('');
  const [routeInput, setRouteInput] = useState('New Delhi to Hyderabad');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [base64Photo, setBase64Photo] = useState('');
  
  // State for holding temporary comment text for specific posts
  const [commentInputs, setCommentInputs] = useState({}); 

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const fetchData = () => {
    fetch('http://localhost:5000/api/reviews').then(r => r.json()).then(d => setReviewsData(d));
    fetch('http://localhost:5000/api/community/posts').then(r => r.json()).then(d => setPosts(d));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBase64Photo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const submitForumPost = async () => {
    await fetch('http://localhost:5000/api/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: "Obed Ganta", isVerified: true, title: postTitle, content: postContent, photoUrl: base64Photo })
    });
    setPostTitle(''); setPostContent(''); setBase64Photo('');
    fetchData();
  };

  const submitComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text) return;
    
    await fetch(`http://localhost:5000/api/community/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: "Obed Ganta", text })
    });
    
    setCommentInputs({ ...commentInputs, [postId]: '' }); // Clear input
    fetchData();
  };

  const handleLike = async (postId) => {
    await fetch(`http://localhost:5000/api/community/posts/${postId}/like`, { method: 'POST' });
    fetchData();
  };

  const handleSocialShare = (title) => {
    if (navigator.share) {
      navigator.share({ title: "RedBus Pro", text: title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("External link copied to clipboard for Social Media!");
    }
  };

  const submitReview = async () => {
    if (editingId) {
      await fetch(`http://localhost:5000/api/reviews/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reviewText, rating })
      });
      setEditingId(null);
    } else {
      await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: "Obed Ganta", pnr: pnrInput, route: routeInput, rating, text: reviewText })
      });
    }
    setReviewText(''); setPnrInput('');
    fetchData();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="flex justify-center border-b dark:border-gray-700 pb-4 gap-6">
        <button onClick={() => setActiveSubTab('reviews')} className={`text-lg font-bold pb-1 ${activeSubTab === 'reviews' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}>
          {t('rateTitle')} (⭐ {reviewsData.avgRating})
        </button>
        <button onClick={() => setActiveSubTab('forum')} className={`text-lg font-bold pb-1 ${activeSubTab === 'forum' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}>
          {t('forumTitle')}
        </button>
      </div>

      {/* TASK 6: VERIFIED REVIEWS */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border">
            <h3 className="font-bold text-lg mb-4 text-green-600">{editingId ? 'Edit Your Review (24h Window)' : t('rateTitle')}</h3>
            {!editingId && (
              <input type="text" value={pnrInput} onChange={e => setPnrInput(e.target.value)} placeholder="Completed PNR Number" className="w-full mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none border" />
            )}
            
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} onClick={() => setRating(star)} className={`cursor-pointer ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} size={24} />
              ))}
            </div>

            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Minimum 20 characters..." className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border h-24 mb-4" />
            <button onClick={submitReview} className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl">{editingId ? 'Update Review' : t('submitReview')}</button>
          </div>

          {reviewsData.reviews.map(rev => (
            <div key={rev._id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold flex items-center gap-1">{rev.user} <ShieldCheck size={16} className="text-green-500" /></span>
                  
                  {/* TASK 6: Trusted Reviewer Badge for Highly Active Users */}
                  {rev.user === 'Obed Ganta' && (
                    <span className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-wider font-black bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 px-2 py-0.5 rounded-full w-fit">
                      <Award size={12} /> Trusted Reviewer
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-yellow-400 font-bold">⭐ {rev.rating}</span>
                  {rev.user === 'Obed Ganta' && (
                    <button onClick={() => { setEditingId(rev._id); setReviewText(rev.text); setRating(rev.rating); }} className="text-blue-500 text-xs flex items-center gap-1"><Edit2 size={12}/> Edit</button>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-400">PNR: {rev.pnr} | {rev.route}</p>
              <p className="mt-2 text-gray-700 dark:text-gray-200">{rev.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* TASK 1: COMMUNITY FORUM */}
      {activeSubTab === 'forum' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border">
            <h3 className="font-bold text-lg mb-4 text-red-600 flex items-center gap-2"><Sparkles /> {t('forumTitle')}</h3>
            <input type="text" value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="Post Title" className="w-full p-3 mb-4 bg-gray-50 dark:bg-gray-700 rounded-xl border" />
            <textarea value={postContent} onChange={e => setPostContent(e.target.value)} placeholder="Share your experience..." className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border h-24 mb-4" />
            
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-4 py-2 rounded-xl border border-blue-200">
                <UploadCloud size={20} />
                <span className="font-bold">{base64Photo ? 'Image Attached!' : 'Upload Photo'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              
              <button onClick={submitForumPost} className="bg-gray-900 dark:bg-red-600 text-white font-bold px-6 py-3 rounded-xl">{t('publish')}</button>
            </div>
          </div>

          {posts.map(post => (
            <div key={post._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                  <p className="text-sm text-gray-500 font-bold flex items-center gap-1">{post.author} <ShieldCheck size={14} className="text-green-500"/></p>
                </div>
                
                {/* TASK 1: Social Media Integration Button */}
                <button onClick={() => handleSocialShare(post.title)} className="text-gray-500 hover:text-blue-500 flex items-center gap-1 text-sm font-bold">
                  <Share2 size={16} /> Share
                </button>
              </div>

              <h4 className="text-xl font-bold mb-2">{post.title}</h4>
              <p className="mb-4">{post.content}</p>
              
              {post.photoUrl && <img src={post.photoUrl} alt="Upload" className="w-full h-64 object-cover rounded-xl mb-4 border" />}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex gap-4 mb-4">
                  <button onClick={() => handleLike(post._id)} className="flex items-center gap-1 hover:text-red-600 font-bold text-sm text-gray-500">
                    <ThumbsUp size={16} /> {post.likes} Likes
                  </button>
                  <span className="flex items-center gap-1 font-bold text-sm text-gray-500">
                    <MessageCircle size={16} /> {post.comments?.length || 0} Comments
                  </span>
                </div>

                {/* TASK 1: Forums & Comments System */}
                <div className="space-y-3 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                  {post.comments?.map((c, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-bold">{c.author}: </span>
                      <span className="text-gray-600 dark:text-gray-300">{c.text}</span>
                    </div>
                  ))}
                  
                  <div className="flex gap-2 mt-2">
                    <input 
                      type="text" 
                      value={commentInputs[post._id] || ''} 
                      onChange={e => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                      placeholder="Add a comment..." 
                      className="flex-1 p-2 text-sm bg-white dark:bg-gray-700 rounded-lg border outline-none" 
                    />
                    <button onClick={() => submitComment(post._id)} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-300">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
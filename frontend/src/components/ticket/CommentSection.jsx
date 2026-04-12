import React from 'react';

const CommentSection = ({ comments, onAddComment, newComment, setNewComment, submitting }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {comments.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
            <p className="text-slate-400 text-sm italic">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">
                {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex-grow">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm group-hover:border-indigo-100 group-hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-slate-900">{comment.authorName}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form 
        onSubmit={onAddComment} 
        className="relative group bg-white p-2 rounded-3xl border border-slate-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition-all"
      >
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Type your message here..."
            className="flex-grow bg-transparent border-none rounded-2xl px-4 py-3 text-sm focus:ring-0 outline-none"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button 
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:bg-slate-200 disabled:shadow-none disabled:text-slate-400 transform active:scale-95 flex items-center justify-center"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;

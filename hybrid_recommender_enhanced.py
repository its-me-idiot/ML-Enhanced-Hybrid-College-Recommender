# hybrid_recommender_enhanced.py - MERGED SYSTEM
# Combines: Authentication + ML Recommendations + Database Integration

import os
import pandas as pd
import numpy as np
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity, linear_kernel
from typing import Optional, Dict, List, Tuple

logger = logging.getLogger("hybrid_recommender")

class EnhancedHybridRecommender:
    """
    Advanced Hybrid Recommendation System
    - Collaborative Filtering (User-User)
    - Content-Based (TF-IDF)
    - Hybrid Blending (configurable alpha)
    - Cold Start Handling
    - Database Integration
    """
    
    def __init__(self, college_data: pd.DataFrame, ratings_path: str, alpha: float = 0.6):
        logger.info("🚀 Initializing Enhanced Hybrid Recommender...")
        
        self.college_data = college_data.copy()
        self.ratings_path = ratings_path
        self.alpha = alpha
        
        self.ratings = None
        self.user_item_matrix = None
        self.user_sim = None
        self.tfidf_matrix = None
        self.tfidf_vectorizer = None
        
        self.user_index = {}
        self.item_index = {}
        self.index_user = {}
        self.index_item = {}
        
        self._load_and_build()
        logger.info("✅ Enhanced Hybrid Recommender ready!")
    
    def _load_and_build(self):
        logger.info("📊 Loading ratings data...")
        if os.path.exists(self.ratings_path):
            self.ratings = pd.read_csv(self.ratings_path)
            logger.info(f"✅ Loaded {len(self.ratings)} ratings from {self.ratings['user_id'].nunique()} users")
        else:
            logger.warning(f"⚠️ No ratings file found at {self.ratings_path}")
            self.ratings = pd.DataFrame(columns=['user_id', 'college_name', 'rating'])
        
        self._build_indices()
        self._build_cf_matrix()
        self._build_content_matrix()
        logger.info("🎉 All matrices built successfully!")
    
    def _build_indices(self):
        if len(self.ratings) == 0:
            return
        
        users = self.ratings['user_id'].unique()
        items = self.college_data['College Name'].unique()
        
        if len(users) == 0 or len(items) == 0:
            return
            
        users = sorted(users.tolist() if hasattr(users, 'tolist') else users)
        items = sorted(items.tolist() if hasattr(items, 'tolist') else items)
        
        self.user_index = {u: i for i, u in enumerate(users)}
        self.index_user = {i: u for u, i in self.user_index.items()}
        self.item_index = {c: i for i, c in enumerate(items)}
        self.index_item = {i: c for c, i in self.item_index.items()}

    def _build_cf_matrix(self):
        if len(self.ratings) == 0 or len(self.user_index) == 0:
            return
            
        try:
            n_users = len(self.user_index)
            n_items = len(self.item_index)
            self.user_item_matrix = np.zeros((n_users, n_items), dtype=np.float32)
            
            for _, row in self.ratings.iterrows():
                user_id = row['user_id']
                college_name = row['college_name']
                rating = row['rating']
                
                if user_id in self.user_index and college_name in self.item_index:
                    u_idx = self.user_index[user_id]
                    i_idx = self.item_index[college_name]
                    self.user_item_matrix[u_idx, i_idx] = rating
            
            if n_users > 1:
                self.user_sim = cosine_similarity(self.user_item_matrix)
            else:
                self.user_sim = np.ones((n_users, n_users))
                
        except Exception as e:
            logger.error(f"❌ CF matrix building failed: {e}")
            self.user_item_matrix = None
            self.user_sim = None
            
    def _build_content_matrix(self):
        content_corpus = []
        for _, college in self.college_data.iterrows():
            text_parts = [
                str(college.get('College Name', '')),
                str(college.get('branch', '')),
                str(college.get('City', '')),
                str(college.get('State', '')),
                str(college.get('Facilities', '')),
                str(college.get('University', '')),
            ]
            content_corpus.append(' '.join(text_parts))
            
        try:
            self.tfidf_vectorizer = TfidfVectorizer(max_features=200, stop_words='english', ngram_range=(1, 2), min_df=2, lowercase=True)
            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(content_corpus)
        except Exception as e:
            logger.error(f"❌ TF-IDF failed: {e}")
            self.tfidf_matrix = None

    # ✅ BUG FIX 1: Map Collaborative Scores using safe College Name Dictionaries
    def _predict_cf_scores(self, user_id: int) -> Dict[str, float]:
        scores_dict = {}
        if user_id not in self.user_index or self.user_sim is None:
            return scores_dict
            
        u_idx = self.user_index[user_id]
        sim_vec = self.user_sim[u_idx]
        
        numer = sim_vec @ self.user_item_matrix
        denom = np.abs(sim_vec).sum()
        
        if denom > 0:
            rated_scores = numer / denom
            for college_name, i_idx in self.item_index.items():
                scores_dict[college_name] = float(rated_scores[i_idx])
                
        return scores_dict

    # ✅ BUG FIX 2: Map TF-IDF Content Scores identically
    def _predict_content_scores(self, user_id: int) -> Dict[str, float]:
        scores_dict = {}
        if user_id not in self.user_index or self.tfidf_matrix is None:
            return scores_dict
            
        u_idx = self.user_index[user_id]
        user_ratings = self.user_item_matrix[u_idx]
        liked_idx = np.where(user_ratings > 0)[0]
        
        if len(liked_idx) == 0:
            return scores_dict
            
        liked_college_names = [self.index_item[i] for i in liked_idx]
        
        liked_df_indices = []
        for name in liked_college_names:
            mask = self.college_data['College Name'] == name
            if mask.any():
                liked_df_indices.append(self.college_data[mask].index[0])
                
        if not liked_df_indices:
            return scores_dict
            
        liked_tfidf = self.tfidf_matrix[liked_df_indices]
        cosine_scores = linear_kernel(liked_tfidf, self.tfidf_matrix)
        weights = user_ratings[liked_idx]
        weighted_scores = (weights[:, None] * cosine_scores).sum(axis=0) / (weights.sum() + 1e-8)
        
        # Link every generated score directly to the College string name
        for idx, score in enumerate(weighted_scores):
            c_name = self.college_data.iloc[idx]['College Name']
            scores_dict[c_name] = float(score)
            
        return scores_dict

    def _blend_scores(self, cf_scores: Dict[str, float], content_scores: Dict[str, float]) -> Dict[str, float]:
        all_colleges = set(cf_scores.keys()).union(set(content_scores.keys()))
        colleges_list = list(all_colleges)
        
        cf_vals = np.array([cf_scores.get(c, 0.0) for c in colleges_list])
        content_vals = np.array([content_scores.get(c, 0.0) for c in colleges_list])
        
        cf_norm = self._min_max_normalize(cf_vals)
        content_norm = self._min_max_normalize(content_vals)
        hybrid_vals = self.alpha * cf_norm + (1 - self.alpha) * content_norm
        
        return {c: float(score) for c, score in zip(colleges_list, hybrid_vals)}

    def _min_max_normalize(self, scores: np.ndarray) -> np.ndarray:
        if len(scores) == 0: return scores
        min_val, max_val = scores.min(), scores.max()
        if max_val - min_val < 1e-8: return np.zeros_like(scores)
        return (scores - min_val) / (max_val - min_val)
    
    def recommend(self, user_id: int, preferences: Dict, limit: int = 50) -> List[Dict]:
        recommendations = self._get_recommendations_internal(user_id, preferences, limit)
        if len(recommendations) == 0:
            recommendations = self._apply_fallback_strategy(user_id, preferences, limit)
        return recommendations

    def _get_recommendations_internal(self, user_id: int, preferences: Dict, limit: int) -> List[Dict]:
        if user_id in self.user_index:
            return self._hybrid_recommendations(user_id, preferences, limit)
        else:
            return self._cold_start_recommendations(preferences, limit)

    def _apply_fallback_strategy(self, user_id: int, original_prefs: Dict, limit: int) -> List[Dict]:
        if original_prefs.get('min_rating', 0) > 0:
            prefs = original_prefs.copy()
            prefs['min_rating'] = max(0, original_prefs['min_rating'] - 1.0)
            recommendations = self._get_recommendations_internal(user_id, prefs, limit)
            if len(recommendations) > 0: return recommendations
            
        prefs = {'branch': '', 'city': '', 'state': '', 'max_fees': 999999999, 'min_rating': 0}
        return self._get_recommendations_internal(user_id, prefs, limit)

    def _hybrid_recommendations(self, user_id: int, preferences: Dict, limit: int) -> List[Dict]:
        cf_scores = self._predict_cf_scores(user_id)
        content_scores = self._predict_content_scores(user_id)
        hybrid_scores = self._blend_scores(cf_scores, content_scores)
        return self._filter_and_rank(hybrid_scores, preferences, limit, user_id)
    
    def _cold_start_recommendations(self, preferences: Dict, limit: int) -> List[Dict]:
        scores_dict = {}
        if len(self.ratings) > 0:
            avg_ratings = self.ratings.groupby('college_name')['rating'].mean()
            scores_dict = avg_ratings.to_dict()
        return self._filter_and_rank(scores_dict, preferences, limit, None)
    
    def _filter_and_rank(self, scores_dict: Dict[str, float], preferences: Dict, limit: int, user_id: Optional[int]) -> List[Dict]:
        filtered_data = self.college_data.copy()

        if preferences.get('branch'):
            filtered_data = filtered_data[filtered_data['branch'].str.contains(preferences['branch'], case=False, na=False)]
        if preferences.get('city'):
            filtered_data = filtered_data[filtered_data['City'].str.contains(preferences['city'], case=False, na=False)]
        if preferences.get('max_fees'):
            filtered_data = filtered_data[pd.to_numeric(filtered_data['Average Fees'], errors='coerce') <= preferences['max_fees']]
        if preferences.get('min_rating'):
            filtered_data = filtered_data[pd.to_numeric(filtered_data['Rating'], errors='coerce') >= preferences['min_rating']]

        if user_id and user_id in self.user_index:
            rated_colleges = set(self.ratings[self.ratings['user_id'] == user_id]['college_name'])
            filtered_data = filtered_data[~filtered_data['College Name'].isin(rated_colleges)]

        if filtered_data.empty:
            return []

        # Map correct score using verified Dictionary values
        filtered_data['ml_score'] = filtered_data['College Name'].apply(lambda name: scores_dict.get(name, 0.0))
        filtered_data = filtered_data.sort_values(by='ml_score', ascending=False)
        
        filtered_data = filtered_data.drop_duplicates(subset=['College Name', 'branch'], keep='first').head(limit)

        recommendations = []
        for _, college in filtered_data.iterrows():
            # ✅ BUG FIX 3: Force output dictionary elements to match React expectations
            rec = {
                'college_name': college.get('College Name'),
                'city': college.get('City'),
                'state': college.get('State'),
                'branch': college.get('branch'),
                'rating': float(college.get('Rating', 0)),
                'average_fees': float(college.get('Average Fees', 0)),
                'university': college.get('University'),
                'facilities': college.get('Facilities'),
                'total_faculty': int(college.get('Total Faculty', 0)) if pd.notna(college.get('Total Faculty')) else 0,
                'total_students': int(college.get('Total Student Enrollments', 0)) if pd.notna(college.get('Total Student Enrollments')) else 0,
                'ml_score': float(college.get('ml_score', 0)),
                'recommendation_type': 'hybrid' if user_id in self.user_index else 'cold_start'
            }
            recommendations.append(rec)

        return recommendations
    
    def add_rating(self, user_id: int, college_name: str, rating: float):
        new_rating = pd.DataFrame([{'user_id': user_id, 'college_name': college_name, 'rating': rating}])
        self.ratings = pd.concat([self.ratings, new_rating], ignore_index=True)
        self.ratings.to_csv(self.ratings_path, index=False)
        logger.info("🔄 Rebuilding recommendation system after new rating...")
        self._load_and_build()
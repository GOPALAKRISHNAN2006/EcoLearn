import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { 
  Video, 
  Search, 
  Filter,
  Play,
  Trash2,
  Edit,
  Upload,
  Eye,
  Clock,
  Calendar,
  Tag,
  Plus,
  X
} from 'lucide-react';

const AIVideos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Mock data for AI videos
  const mockVideos = [
    {
      id: 1,
      title: 'Introduction to Machine Learning',
      description: 'Learn the basics of machine learning and AI concepts',
      thumbnail: 'https://via.placeholder.com/320x180/3b82f6/ffffff?text=ML+Intro',
      duration: '15:30',
      views: 1250,
      category: 'AI Fundamentals',
      uploadedAt: '2024-11-15',
      status: 'published'
    },
    {
      id: 2,
      title: 'Neural Networks Explained',
      description: 'Deep dive into how neural networks work',
      thumbnail: 'https://via.placeholder.com/320x180/22c55e/ffffff?text=Neural+Networks',
      duration: '22:45',
      views: 890,
      category: 'Deep Learning',
      uploadedAt: '2024-11-20',
      status: 'published'
    },
    {
      id: 3,
      title: 'Natural Language Processing',
      description: 'Understanding NLP and text processing with AI',
      thumbnail: 'https://via.placeholder.com/320x180/8b5cf6/ffffff?text=NLP',
      duration: '18:20',
      views: 650,
      category: 'NLP',
      uploadedAt: '2024-11-25',
      status: 'published'
    },
    {
      id: 4,
      title: 'Computer Vision Basics',
      description: 'Introduction to image recognition and computer vision',
      thumbnail: 'https://via.placeholder.com/320x180/f59e0b/ffffff?text=Computer+Vision',
      duration: '20:10',
      views: 720,
      category: 'Computer Vision',
      uploadedAt: '2024-11-28',
      status: 'draft'
    },
    {
      id: 5,
      title: 'Reinforcement Learning',
      description: 'Learn how AI agents learn through trial and error',
      thumbnail: 'https://via.placeholder.com/320x180/ef4444/ffffff?text=RL',
      duration: '25:00',
      views: 430,
      category: 'AI Fundamentals',
      uploadedAt: '2024-12-01',
      status: 'published'
    },
    {
      id: 6,
      title: 'AI Ethics and Responsible AI',
      description: 'Understanding ethical considerations in AI development',
      thumbnail: 'https://via.placeholder.com/320x180/6366f1/ffffff?text=AI+Ethics',
      duration: '16:45',
      views: 320,
      category: 'AI Ethics',
      uploadedAt: '2024-12-02',
      status: 'published'
    }
  ];

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }
    // Load mock videos
    setVideos(mockVideos);
  }, [navigate]);

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteVideo = (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    setVideos(videos.filter(v => v.id !== id));
    setSuccessMessage('Video deleted successfully!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <AdminNavbar />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              AI Videos
            </h1>
            <p style={{ color: '#6b7280' }}>Manage educational AI video content</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <Upload size={18} />
            Upload Video
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#dcfce7', 
            color: '#166534', 
            borderRadius: '0.5rem', 
            marginBottom: '1rem' 
          }}>
            {successMessage}
            <button onClick={() => setSuccessMessage('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {[
            { label: 'Total Videos', value: videos.length, color: '#3b82f6' },
            { label: 'Published', value: videos.filter(v => v.status === 'published').length, color: '#22c55e' },
            { label: 'Drafts', value: videos.filter(v => v.status === 'draft').length, color: '#f59e0b' },
            { label: 'Total Views', value: videos.reduce((acc, v) => acc + v.views, 0).toLocaleString(), color: '#8b5cf6' }
          ].map((stat, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '1rem', 
          padding: '1.5rem', 
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search videos by title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredVideos.map((video) => (
            <div key={video.id} style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '100%',
                  height: '180px',
                  backgroundColor: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Video size={48} color="#9ca3af" />
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem'
                }}>
                  {video.duration}
                </div>
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: video.status === 'published' ? '#22c55e' : '#f59e0b',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  textTransform: 'capitalize'
                }}>
                  {video.status}
                </div>
                {/* Play Button Overlay */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '60px',
                  height: '60px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: 0.9
                }}>
                  <Play size={24} color="#3b82f6" style={{ marginLeft: '4px' }} />
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {video.title}
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {video.description}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontSize: '0.75rem' }}>
                    <Tag size={14} />
                    {video.category}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontSize: '0.75rem' }}>
                    <Eye size={14} />
                    {video.views} views
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#9ca3af', fontSize: '0.75rem' }}>
                    <Calendar size={14} />
                    {formatDate(video.uploadedAt)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setSelectedVideo(video)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#dbeafe',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit size={16} color="#3b82f6" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#fee2e2',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Upload New Video</h3>
                <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={24} color="#6b7280" />
                </button>
              </div>
              
              <div style={{ 
                border: '2px dashed #e5e7eb',
                borderRadius: '0.75rem',
                padding: '3rem',
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                <Upload size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Drag and drop your video here</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>or</p>
                <button style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}>
                  Browse Files
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Video Title"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                />
                <textarea
                  placeholder="Description"
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', resize: 'vertical' }}
                />
                <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                  <option value="">Select Category</option>
                  <option value="ai-fundamentals">AI Fundamentals</option>
                  <option value="deep-learning">Deep Learning</option>
                  <option value="nlp">NLP</option>
                  <option value="computer-vision">Computer Vision</option>
                  <option value="ai-ethics">AI Ethics</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIVideos;

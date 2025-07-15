
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star, Play, Calendar, Clock, Users, User } from 'lucide-react';
import HorizontalSection from '@/components/HorizontalSection';

const Player = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const content = location.state || {};

  // Comprehensive debugging
  console.log('=== PLAYER DEBUG INFO ===');
  console.log('Location state:', location.state);
  console.log('Content object:', content);
  console.log('Content keys:', Object.keys(content));
  console.log('Content.movie:', content.movie);
  console.log('Content.web_series:', content.web_series);
  console.log('Content.show:', content.show);
  console.log('Content.content_type:', content.content_type);
  console.log('========================');

  // Get the actual video URL based on content type
  const getVideoUrl = () => {
    console.log('Getting video URL for content:', content);
    console.log('Content type:', content.content_type);

    if (content.content_type === 'Movie' && content.movie?.video_url) {
      console.log('Movie video URL found:', content.movie.video_url);
      return content.movie.video_url;
    } else if (content.content_type === 'Web Series' && content.web_series?.seasons?.[0]?.episodes?.[0]?.video_url) {
      console.log('Web Series video URL found:', content.web_series.seasons[0].episodes[0].video_url);
      return content.web_series.seasons[0].episodes[0].video_url;
    } else if (content.content_type === 'Show' && content.show?.episode_id_list?.length > 0) {
      const showVideoUrl = content.videoUrl || content.video_url;
      console.log('Show video URL found:', showVideoUrl);
      return showVideoUrl;
    }

    // Fallback to any video URL in the content object
    const fallbackUrl = content.videoUrl || content.video_url || content.movie?.video_url;
    console.log('Using fallback video URL:', fallbackUrl);
    return fallbackUrl || '';
  };

  // Get trailer URL based on content type
  const getTrailerUrl = () => {
    if (content.content_type === 'Movie' && content.movie?.trailer_url) {
      return content.movie.trailer_url;
    } else if (content.content_type === 'Web Series' && content.web_series?.seasons?.[0]?.trailer_url) {
      return content.web_series.seasons[0].trailer_url;
    } else if (content.content_type === 'Show' && content.show?.trailer_url) {
      return content.show.trailer_url;
    }
    return null;
  };

  const videoUrl = getVideoUrl();
  const trailerUrl = getTrailerUrl();

  console.log('Final video URL for player:', videoUrl, 'for content type:', content.content_type);
  console.log('Trailer URL:', trailerUrl);

  // Check if URL is a YouTube URL and convert to embeddable format
  const getEmbeddableUrl = (url: string) => {
    if (!url) return '';

    // YouTube URL patterns
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';

      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtube.com/embed/')) {
        return url; // Already in embed format
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0&modestbranding=1&showinfo=0`;
      }
    }

    // Vimeo URL patterns
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop()?.split('?')[0];
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`;
      }
    }

    // Dailymotion URL patterns
    if (url.includes('dailymotion.com')) {
      const videoId = url.split('/video/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=0&ui-logo=0`;
      }
    }

    // For direct video files or other platforms, return as is
    return url;
  };

  const embedUrl = getEmbeddableUrl(videoUrl);
  const trailerEmbedUrl = getEmbeddableUrl(trailerUrl || '');
  const isEmbeddable = videoUrl && (
    videoUrl.includes('youtube.com') || 
    videoUrl.includes('youtu.be') || 
    videoUrl.includes('vimeo.com') || 
    videoUrl.includes('dailymotion.com') ||
    embedUrl !== videoUrl
  );

  const [showTrailer, setShowTrailer] = useState(false);

  const handleTrailerClick = () => {
    if (trailerUrl) {
      setShowTrailer(!showTrailer);
    }
  };

  const getContentTypeDisplay = () => {
    switch (content.content_type) {
      case 'Movie': return 'Movie';
      case 'Web Series': return 'Web Series';
      case 'Show': return 'TV Show';
      default: 
        // Fallback for legacy data
        if (content.type === 'series') return 'Web Series';
        if (content.type === 'show') return 'TV Show';
        return content.content_type || content.type || 'Content';
    }
  };

  const getSeasonEpisodeInfo = () => {
    if (content.content_type === 'Web Series' && content.web_series?.seasons?.[0]) {
      const season = content.web_series.seasons[0];
      const seasonNumber = content.seasonNumber || season.season_number || 1;
      const episodeNumber = content.episodeNumber || 1;
      return `Season ${seasonNumber} • Episode ${episodeNumber}`;
    }
    return null;
  };

  const getDuration = () => {
    if (content.content_type === 'Movie' && content.movie?.duration) {
      return `${content.movie.duration} min`;
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="sm"
              className="bg-primary/5 backdrop-blur-sm border border-primary/30 text-primary hover:bg-gradient-to-br hover:from-black/30 hover:via-[#0A7D4B]/5 hover:to-black/30 hover:border-primary/20 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Main Content Layout */}
          <div className="space-y-8">
            {/* Video Player and Details - Side by Side */}
            <Card className="bg-gradient-to-br from-black/90 via-[#0A7D4B]/20 to-black/90 backdrop-blur-sm border border-border/50 wave-transition relative overflow-hidden">
              {/* Animated Background Waves */}
              <div className="absolute inset-0">
                <div className="player-wave-bg-1"></div>
                <div className="player-wave-bg-2"></div>
                <div className="player-wave-bg-3"></div>
              </div>

              <CardContent className="p-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Half - Video Player */}
                  <div className="space-y-4">
                    <div className="aspect-video bg-gradient-to-br from-black/95 via-[#0A7D4B]/10 to-black/95 rounded-xl relative border border-primary/20 shadow-2xl overflow-hidden custom-video-container">
                      {(showTrailer && trailerUrl) ? (
                        /* Trailer Player */
                        <div className="relative w-full h-full">
                          <iframe
                            className="w-full h-full rounded-xl"
                            src={trailerEmbedUrl}
                            title={`${content.title} - Trailer`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            style={{
                              filter: 'contrast(1.1) brightness(1.05)',
                              border: 'none'
                            }}
                          />
                          <div className="absolute top-4 right-4">
                            <Button
                              onClick={() => setShowTrailer(false)}
                              size="sm"
                              variant="outline"
                              className="bg-black/80 border-white/30 text-white hover:bg-black/60"
                            >
                              Back to Content
                            </Button>
                          </div>
                        </div>
                      ) : videoUrl ? (
                        isEmbeddable ? (
                          /* Main Content Player */
                          <div className="relative w-full h-full">
                            <iframe
                              className="w-full h-full rounded-xl"
                              src={embedUrl}
                              title={content.title || 'Video Player'}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              style={{
                                filter: 'contrast(1.1) brightness(1.05)',
                                border: 'none'
                              }}
                            />

                            {/* Custom overlay to maintain app theme */}
                            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                          </div>
                        ) : (
                          /* Direct Video File Player */
                          <video
                            className="w-full h-full rounded-xl object-cover custom-video-player"
                            controls
                            poster={content.image || content.thumbnail_url || content.movie?.thumbnail_url}
                            preload="metadata"
                            style={{
                              filter: 'contrast(1.1) brightness(1.05)',
                              outline: 'none'
                            }}
                          >
                            <source src={videoUrl} type="video/mp4" />
                            <source src={videoUrl} type="video/webm" />
                            <source src={videoUrl} type="video/ogg" />
                            Your browser does not support the video tag.
                          </video>
                        )
                      ) : (
                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-black/95 via-[#0A7D4B]/10 to-black/95 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-red-400 text-lg mb-2">⚠️ Video Not Available</div>
                            <p className="text-muted-foreground text-sm">
                              No video URL found for this content
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-2">
                              Content Type: {getContentTypeDisplay()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Half - Content Details */}
                  <div className="space-y-6 relative">
                    {/* Content Type Badge - Top Right */}
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-r from-yellow-600/90 to-yellow-700/90 backdrop-blur-sm border border-yellow-500/50 rounded-lg px-4 py-2 shadow-lg">
                        <span className="text-yellow-100 text-sm font-bold">
                          {getContentTypeDisplay()}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="pr-32 pt-12">
                      <h1 className="text-3xl font-bold text-foreground mb-4">
                        {content.title}
                      </h1>
                    </div>

                    {/* Season & Episode Info for Web Series */}
                    {getSeasonEpisodeInfo() && (
                      <div className="mb-4">
                        <span className="text-primary text-lg font-medium">
                          {getSeasonEpisodeInfo()}
                        </span>
                      </div>
                    )}

                    {/* Rating and Year Info */}
                    <div className="flex items-center space-x-6 flex-wrap">
                      {(content.rating || content.rating_type || content.movie?.rating_type || content.show?.rating_type) && (
                        <span className="bg-primary/20 text-primary px-4 py-2 rounded-lg border border-primary/30 text-sm font-medium">
                          {content.rating || content.rating_type || content.movie?.rating_type || content.show?.rating_type}
                        </span>
                      )}
                      {(content.score || content.rating || content.movie?.rating || content.show?.rating) && (
                        <div className="flex items-center space-x-2">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="text-foreground text-lg font-medium">
                            {content.score || content.rating || content.movie?.rating || content.show?.rating}
                          </span>
                        </div>
                      )}
                      {(content.year || content.release_year || content.movie?.release_year || content.show?.release_year) && (
                        <span className="text-muted-foreground text-lg font-medium">
                          {content.year || content.release_year || content.movie?.release_year || content.show?.release_year}
                        </span>
                      )}
                      {getDuration() && (
                        <span className="text-muted-foreground text-lg font-medium">
                          {getDuration()}
                        </span>
                      )}
                    </div>

                    
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advertisement Section - Full Width with Increased Height */}
            <div className="w-full">
              <Card className="bg-gradient-to-br from-black/40 via-[#0A7D4B]/10 to-black/40 backdrop-blur-sm border border-border/30 min-h-[400px]">
                <CardContent className="p-12 flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-muted-foreground/50 text-2xl mb-4">Advertisement Space</div>
                    <div className="text-muted-foreground/30 text-lg">Full Width Banner - 1200x400</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;

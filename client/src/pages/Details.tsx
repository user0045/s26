import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, ExternalLink, ChevronDown, ArrowLeft, Star, Calendar, Clock } from 'lucide-react';
import { useAllContent } from '@/hooks/useContentQueries';

const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false); // State to control visibility of all details

  const { data: allContent, isLoading } = useAllContent();

  // Extract season from URL if present (for web series)
  useEffect(() => {
    if (id && typeof id === 'string' && id.includes('-season-')) {
      const seasonMatch = id.match(/-season-(\d+)$/);
      if (seasonMatch) {
        setSelectedSeason(parseInt(seasonMatch[1], 10));
      }
    }
  }, [id]);

  // Find the content item
  const content = React.useMemo(() => {
    // If we have state data from navigation, use it directly
    if (location.state && typeof location.state === 'object') {
      console.log('Using content from location state:', location.state);
      return location.state;
    }

    if (!allContent || !id) return null;

    // Search in all content types
    const allItems = [
      ...(allContent.movies || []),
      ...(allContent.webSeries || []),
      ...(allContent.shows || [])
    ];

    console.log('Searching for content with ID:', id);
    console.log('Available items:', allItems.map(item => ({ id: item.id, content_id: item.content_id, title: item.title })));

    // Enhanced search logic to handle different ID formats
    const foundContent = allItems.find(item => {
      // Direct ID match
      if (item.id === id || item.content_id === id) {
        return true;
      }

      // For season-based IDs (e.g., "da1939d9-be6c-434f-9ea3-6440b588cd6c-season-1")
      if (typeof item.id === 'string' && item.id.includes('-season-')) {
        const baseId = item.id.split('-season-')[0];
        if (baseId === id) {
          return true;
        }
      }

      // Check nested content structures
      if (item.movie && item.movie.content_id === id) {
        return true;
      }

      if (item.web_series && item.web_series.content_id === id) {
        return true;
      }

      if (item.show && (item.show.id === id || item.show.content_id === id)) {
        return true;
      }

      // Check if the search ID contains season info and match base content_id
      if (typeof id === 'string' && id.includes('-season-')) {
        const baseSearchId = id.split('-season-')[0];
        if (item.id === baseSearchId || item.content_id === baseSearchId) {
          return true;
        }
      }

      return false;
    });

    console.log('Found content:', foundContent);
    return foundContent;
  }, [allContent, id, location.state]);

  const [currentSeasonEpisodes, setCurrentSeasonEpisodes] = useState<any[]>([]);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      if (content?.content_type === 'Web Series' && content.web_series?.seasons) {
        const seasonData = content.web_series.seasons[selectedSeason - 1];
        if (seasonData?.episodes && Array.isArray(seasonData.episodes)) {
          // Use actual episode data from the season
          const episodes = seasonData.episodes.map((episode, index) => ({
            id: episode.episode_id || `episode-${index + 1}`,
            title: episode.title || `Episode ${index + 1}`,
            description: episode.description || 'No description available',
            duration: episode.duration || null,
            thumbnail_url: episode.thumbnail_url || null
          }));
          setCurrentSeasonEpisodes(episodes);
        } else if (seasonData?.episode_id_list && Array.isArray(seasonData.episode_id_list)) {
          // Fetch real episode data from database
          const { supabase } = await import('@/integrations/supabase/client');
          const episodes = [];
          
          for (const episodeId of seasonData.episode_id_list) {
            try {
              const { data: episodeData, error } = await supabase
                .from('episode')
                .select('*')
                .eq('episode_id', episodeId)
                .single();
              
              if (!error && episodeData) {
                episodes.push({
                  id: episodeData.episode_id,
                  title: episodeData.title || `Episode ${episodes.length + 1}`,
                  description: episodeData.description || 'No description available',
                  duration: episodeData.duration || null,
                  thumbnail_url: episodeData.thumbnail_url || null
                });
              }
            } catch (err) {
              console.error('Error fetching episode:', err);
            }
          }
          
          setCurrentSeasonEpisodes(episodes);
        }
      } else if (content?.content_type === 'Show' && content.show?.episode_id_list) {
        // Fetch real episode data for shows
        const { supabase } = await import('@/integrations/supabase/client');
        const episodes = [];
        
        for (const episodeId of content.show.episode_id_list) {
          try {
            const { data: episodeData, error } = await supabase
              .from('episode')
              .select('*')
              .eq('episode_id', episodeId)
              .single();
            
            if (!error && episodeData) {
              episodes.push({
                id: episodeData.episode_id,
                title: episodeData.title || `Episode ${episodes.length + 1}`,
                description: episodeData.description || 'No description available',
                duration: episodeData.duration || null,
                thumbnail_url: episodeData.thumbnail_url || null
              });
            }
          } catch (err) {
            console.error('Error fetching episode:', err);
          }
        }
        
        // Reverse order for shows (latest first)
        setCurrentSeasonEpisodes(episodes.reverse());
      }
    };

    fetchEpisodeData();
  }, [content, selectedSeason]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-lg">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    console.log('Content not found for ID:', id);
    console.log('Available content:', allContent);
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-lg mb-4">Content not found</div>
                <div className="text-sm text-gray-400">ID: {id}</div>
                <div className="text-sm text-gray-400 mt-2">
                  Available items: {allContent ? (allContent.movies?.length || 0) + (allContent.webSeries?.length || 0) + (allContent.shows?.length || 0) : 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePlayClick = (episodeId?: string) => {
    if (content.content_type === 'Movie') {
      navigate(`/player/${content.content_id}`, { state: content });
    } else if (episodeId) {
      navigate(`/player/${content.content_id}?episode=${episodeId}`, { state: content });
    } else {
      navigate(`/player/${content.content_id}`, { state: content });
    }
  };

  const handleTrailerClick = () => {
    // Handle trailer functionality
    console.log('Play trailer');
  };

  // Get content details based on type
  const getContentDetails = () => {
    if (content.content_type === 'Movie' && content.movie) {
      return {
        description: content.movie.description,
        release_year: content.movie.release_year,
        rating_type: content.movie.rating_type,
        rating: content.movie.rating,
        duration: content.movie.duration,
        directors: content.movie.director || [],
        writers: content.movie.writer || [],
        cast: content.movie.cast_members || [],
        thumbnail_url: content.movie.thumbnail_url,
        trailer_url: content.movie.trailer_url,
        genres: content.genre || []
      };
    } else if (content.content_type === 'Web Series' && content.web_series?.seasons?.[0]) {
      const season = content.web_series.seasons[0];
      return {
        description: season.season_description,
        release_year: season.release_year,
        rating_type: season.rating_type,
        rating: season.rating,
        duration: null,
        directors: season.director || [],
        writers: season.writer || [],
        cast: season.cast_members || [],
        thumbnail_url: season.thumbnail_url,
        trailer_url: season.trailer_url,
        genres: content.genre || []
      };
    } else if (content.content_type === 'Show' && content.show) {
      return {
        description: content.show.description,
        release_year: content.show.release_year,
        rating_type: content.show.rating_type,
        rating: content.show.rating,
        duration: null,
        directors: content.show.directors || [],
        writers: content.show.writers || [],
        cast: content.show.cast_members || [],
        thumbnail_url: content.show.thumbnail_url,
        trailer_url: content.show.trailer_url,
        genres: content.show.genres || content.genre || []
      };
    }
    return {
      description: '',
      release_year: null,
      rating_type: null,
      rating: null,
      duration: null,
      directors: [],
      writers: [],
      cast: [],
      thumbnail_url: '',
      trailer_url: '',
      genres: []
    };
  };

  const details = getContentDetails();

  // Helper function to get season/episode count info
  const getCountInfo = () => {
    if (content.content_type === 'Web Series' && content.web_series?.season_id_list) {
      const seasonCount = content.web_series.season_id_list.length;
      return `${seasonCount} Season${seasonCount > 1 ? 's' : ''}`;
    } else if (content.content_type === 'Show' && content.show?.episode_id_list) {
      const episodeCount = content.show.episode_id_list.length;
      return `${episodeCount} Episode${episodeCount > 1 ? 's' : ''}`;
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
            {/* Content Details Card */}
            <Card className="bg-gradient-to-br from-black/90 via-[#0A7D4B]/20 to-black/90 backdrop-blur-sm border border-border/50 wave-transition relative overflow-hidden">
              {/* Animated Background Waves */}
              <div className="absolute inset-0">
                <div className="player-wave-bg-1"></div>
                <div className="player-wave-bg-2"></div>
                <div className="player-wave-bg-3"></div>
              </div>

              <CardContent className="p-8 relative z-10">
                {content.content_type === 'Movie' ? (
                  /* Movie Layout - Full Width */
                  <div className="space-y-6">
                    {/* Content Type Badge - Top Right */}
                    <div className="absolute top-8 right-8">
                      <div className="bg-gradient-to-r from-yellow-600/90 to-yellow-700/90 backdrop-blur-sm border border-yellow-500/50 rounded-lg px-4 py-2 shadow-lg">
                        <span className="text-yellow-100 text-sm font-bold">Movie</span>
                      </div>
                    </div>

                    {/* Thumbnail and Content Info Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left - Thumbnail */}
                      <div className="space-y-4">
                        <div 
                          className="relative overflow-hidden rounded-lg cursor-pointer group"
                          onClick={() => handlePlayClick()}
                        >
                          <img
                            src={details.thumbnail_url || '/placeholder.svg'}
                            alt={content.title}
                            className="w-full h-[400px] object-cover rounded-lg border border-primary/20 shadow-2xl"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="space-y-3">
                          <Button 
                            onClick={() => handlePlayClick()}
                            className="w-full bg-primary/10 backdrop-blur-sm border border-primary/50 text-primary hover:bg-gradient-to-br hover:from-black/60 hover:via-[#0A7D4B]/10 hover:to-black/60 hover:border-primary/30 transition-all duration-300"
                          >
                            <Play className="w-5 h-5 mr-2" />
                            Play
                          </Button>
                          <Button 
                            onClick={handleTrailerClick}
                            variant="outline"
                            className="w-full bg-primary/5 backdrop-blur-sm border border-primary/30 text-primary hover:bg-gradient-to-br hover:from-black/30 hover:via-[#0A7D4B]/5 hover:to-black/30 hover:border-primary/20 transition-all duration-300"
                          >
                            <ExternalLink className="w-5 h-5 mr-2" />
                            Trailer
                          </Button>
                        </div>
                      </div>

                      {/* Right - Essential Movie Details Only */}
                      <div className="space-y-6 pr-16 pt-12">
                        <h1 className="text-3xl font-bold text-foreground">{content.title}</h1>

                        {/* Rating and Year Info */}
                        <div className="flex items-center space-x-6 flex-wrap">
                          {details.rating_type && (
                            <span className="bg-primary/20 text-primary px-4 py-2 rounded-lg border border-primary/30 text-sm font-medium">
                              {details.rating_type}
                            </span>
                          )}
                          {details.rating && (
                            <div className="flex items-center space-x-2">
                              <Star className="h-5 w-5 text-yellow-400 fill-current" />
                              <span className="text-foreground text-lg font-medium">
                                {details.rating}
                              </span>
                            </div>
                          )}
                          {details.release_year && (
                            <span className="text-muted-foreground text-lg font-medium">
                              {details.release_year}
                            </span>
                          )}
                          {details.duration && (
                            <span className="text-muted-foreground text-lg font-medium">
                              {details.duration} min
                            </span>
                          )}
                        </div>

                        {/* Essential Info */}
                        <div className="space-y-4">
                          {!showAllDetails && details.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                              {details.description}
                            </p>
                          )}

                          {/* See More Button */}
                          <button 
                            onClick={() => setShowAllDetails(!showAllDetails)}
                            className="text-primary hover:text-primary/80 text-sm font-medium bg-transparent border-none p-0 cursor-pointer transition-colors duration-300 animate-pulse"
                          >
                            {showAllDetails ? 'Show Less' : 'See More'}
                          </button>

                          {/* Expanded Details */}
                          {showAllDetails && (
                            <div className="space-y-4 animate-in slide-in-from-top-5 duration-300">
                              {details.description && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                                  <p className="text-muted-foreground text-sm leading-relaxed">
                                    {details.description}
                                  </p>
                                </div>
                              )}

                              {details.directors.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">Directors</h4>
                                  <p className="text-muted-foreground text-sm">
                                    {details.directors.join(', ')}
                                  </p>
                                </div>
                              )}

                              {details.writers.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">Writers</h4>
                                  <p className="text-muted-foreground text-sm">
                                    {details.writers.join(', ')}
                                  </p>
                                </div>
                              )}

                              {details.cast.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">Cast</h4>
                                  <p className="text-muted-foreground text-sm">
                                    {details.cast.join(', ')}
                                  </p>
                                </div>
                              )}

                              {details.genres.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">Genres</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {details.genres.map((genre, index) => {
                                      const genreColors = {
                                        'Action': 'bg-red-500/20 text-red-300 border-red-500/30',
                                        'Adventure': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
                                        'Comedy': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
                                        'Drama': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                                        'Horror': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
                                        'Thriller': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                                        'Sci-Fi': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                                        'Fantasy': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
                                        'Romance': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
                                        'Crime': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
                                        'Family': 'bg-green-500/20 text-green-300 border-green-500/30'
                                      };
                                      const colorClass = genreColors[genre] || 'bg-primary/20 text-primary border-primary/30';
                                      return (
                                        <span key={index} className={`px-2 py-1 rounded-md text-xs font-medium border ${colorClass}`}>
                                          {genre}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Web Series/Show Layout - Left: Details, Right: Seasons/Episodes */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Half - Content Details */}
                    <div className="space-y-6 relative">

                      {/* Thumbnail */}
                      <div className="pr-32 pt-12">
                        <div 
                          className="relative overflow-hidden rounded-lg cursor-pointer group"
                          onClick={() => handlePlayClick()}
                        >
                          <img
                            src={details.thumbnail_url || '/placeholder.svg'}
                            alt={content.title}
                            className="w-full h-[300px] object-cover rounded-lg border border-primary/20 shadow-2xl"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="space-y-3">
                       {content.content_type !== 'Web Series' && content.content_type !== 'Show' && (
                          <Button 
                            onClick={() => handlePlayClick()}
                            className="w-full bg-primary/10 backdrop-blur-sm border border-primary/50 text-primary hover:bg-gradient-to-br hover:from-black/60 hover:via-[#0A7D4B]/10 hover:to-black/60 hover:border-primary/30 transition-all duration-300"
                          >
                            <Play className="w-5 h-5 mr-2" />
                            Play
                          </Button>
                       )}
                        <Button 
                          onClick={handleTrailerClick}
                          variant="outline"
                          className="w-full bg-primary/5 backdrop-blur-sm border border-primary/30 text-primary hover:bg-gradient-to-br hover:from-black/30 hover:via-[#0A7D4B]/5 hover:to-black/30 hover:border-primary/20 transition-all duration-300"
                        >
                          <ExternalLink className="w-5 h-5 mr-2" />
                          Trailer
                        </Button>
                      </div>

                      {/* Essential Details Only */}
                      <div className="space-y-4">
                        <h1 className="text-3xl font-bold text-foreground">{content.title}</h1>

                        <div className="flex items-center space-x-6 flex-wrap">
                          {details.rating_type && (
                            <span className="bg-primary/20 text-primary px-4 py-2 rounded-lg border border-primary/30 text-sm font-medium">
                              {details.rating_type}
                            </span>
                          )}
                          {details.rating && (
                            <div className="flex items-center space-x-2">
                              <Star className="h-5 w-5 text-yellow-400 fill-current" />
                              <span className="text-foreground text-lg font-medium">
                                {details.rating}
                              </span>
                            </div>
                          )}
                          {details.release_year && (
                            <span className="text-muted-foreground text-lg font-medium">
                              {details.release_year}
                            </span>
                          )}
                          {details.duration && (
                            <span className="text-muted-foreground text-lg font-medium">
                              {details.duration}
                            </span>
                          )}
                        </div>

                        {/* Essential Info */}
                        <div className="space-y-4">
                          {!showAllDetails && details.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                              {details.description}
                            </p>
                          )}

                          {/* See More Button */}
                          <button 
                            onClick={() => setShowAllDetails(!showAllDetails)}
                            className="text-primary hover:text-primary/80 text-sm font-medium bg-transparent border-none p-0 cursor-pointer transition-colors duration-300 animate-pulse"
                          >
                            {showAllDetails ? 'Show Less' : 'See More'}
                          </button>

                          {/* Expanded Details */}
                          {showAllDetails && (
                            <div className="space-y-4 animate-in slide-in-from-top-5 duration-300">
                              {details.description && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                                  <p className="text-muted-foreground text-sm leading-relaxed">
                                    {details.description}
                                  </p>
                                </div>
                              )}

                              {details.directors.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">Directors</h4>
                                  <p className="text-muted-foreground text-sm">
                                    {details.directors.join(', ')}
                                  </p>
                                </div>
                              )}

                              {details.writers.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">Writers</h4>
                                  <p className="text-muted-foreground text-sm">
                                    {details.writers.join(', ')}
                                  </p>
                                </div>
                              )}

                              {details.cast.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">Cast</h4>
                                  <p className="text-muted-foreground text-sm">
                                    {details.cast.join(', ')}
                                  </p>
                                </div>
                              )}

                              {details.genres.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">Genres</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {details.genres.map((genre, index) => {
                                      const genreColors = {
                                        'Action': 'bg-red-500/20 text-red-300 border-red-500/30',
                                        'Adventure': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
                                        'Comedy': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
                                        'Drama': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                                        'Horror': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
                                        'Thriller': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                                        'Sci-Fi': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                                        'Fantasy': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
                                        'Romance': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
                                        'Crime': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
                                        'Family': 'bg-green-500/20 text-green-300 border-green-500/30'
                                      };
                                      const colorClass = genreColors[genre] || 'bg-primary/20 text-primary border-primary/30';
                                      return (
                                        <span key={index} className={`px-2 py-1 rounded-md text-xs font-medium border ${colorClass}`}>
                                          {genre}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Half - Seasons/Episodes Only */}
                    <div className="space-y-6 relative">
                      {/* Content Type Badge and Count Info - Top Right */}
                      <div className="absolute top-0 right-0 flex items-center gap-3 z-10">
                        {getCountInfo() && (
                          <div className="bg-gradient-to-r from-primary/20 to-primary/30 backdrop-blur-sm border border-primary/40 rounded-lg px-3 py-2 shadow-lg">
                            <span className="text-primary text-sm font-medium">
                              {getCountInfo()}
                            </span>
                          </div>
                        )}
                        <div className="bg-gradient-to-r from-yellow-600/90 to-yellow-700/90 backdrop-blur-sm border border-yellow-500/50 rounded-lg px-4 py-2 shadow-lg">
                          <span className="text-yellow-100 text-sm font-bold">
                            {content.content_type === 'Show' ? 'TV Show' : content.content_type}
                          </span>
                        </div>
                      </div>

                      {/* Season Dropdown for Web Series */}
                      {content.content_type === 'Web Series' && content.web_series?.season_id_list && (
                        <div className="mt-24 mb-4">
                          <div className="relative" style={{ zIndex: 1000 }}>
                            <button
                              onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                              className="flex items-center justify-between w-full p-3 bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-lg text-left text-primary hover:bg-primary/20 transition-all duration-300"
                            >
                              <span>Season {selectedSeason}</span>
                              <ChevronDown className={`w-5 h-5 transition-transform ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isSeasonDropdownOpen && (
                              <div 
                                className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-sm border border-primary/30 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-2xl"
                                style={{ zIndex: 1001 }}
                              >
                                {content.web_series.season_id_list.map((seasonId, index) => (
                                  <button
                                    key={seasonId}
                                    onClick={() => {
                                      setSelectedSeason(index + 1);
                                      setIsSeasonDropdownOpen(false);
                                    }}
                                    className={`w-full p-3 text-left transition-all duration-300 first:rounded-t-lg last:rounded-b-lg ${
                                      selectedSeason === index + 1 
                                        ? 'bg-primary/30 text-primary border-l-4 border-primary' 
                                        : 'text-primary hover:bg-primary/20'
                                    }`}
                                  >
                                    Season {index + 1}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Episodes List */}
                      {currentSeasonEpisodes.length > 0 && (
                        <div className={`max-h-96 overflow-y-auto ${content.content_type === 'Show' ? 'mt-24' : 'mt-6'}`}>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">
                              {content.content_type === 'Web Series' ? 'Episodes' : 'Latest Episodes'}
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              {currentSeasonEpisodes.length} episode{currentSeasonEpisodes.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {currentSeasonEpisodes.map((episode, index) => (
                              <div
                                key={episode.id}
                                onClick={() => handlePlayClick(episode.id)}
                                className="p-3 bg-primary/5 backdrop-blur-sm border border-primary/20 rounded-lg cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                              >
                                <div className="flex-1">
                                  <h4 className="font-medium text-foreground">{episode.title}</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed truncate">{episode.description}</p>
                                  {episode.duration && (
                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                      Duration: {episode.duration} min
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Advertisement Section */}
            <div className="w-full">
              <Card className="bg-gradient-to-br from-black/40 via-[#0A7D4B]/10 to-black/40 backdrop-blur-sm border border-border/30 min-h-[200px]">
                <CardContent className="p-8 flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-muted-foreground/50 text-xl mb-2">Advertisement Space</div>
                    <div className="text-muted-foreground/30 text-sm">Full Width Banner</div>
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

export default Details;
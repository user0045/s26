import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Play, Calendar, Clock } from 'lucide-react';

const UpcomingMoreInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const content = location.state;

  // Debug thumbnail URL
  console.log('UpcomingMoreInfo content:', content);
  console.log('UpcomingMoreInfo thumbnail_url:', content?.thumbnail_url);

  const handleTrailerClick = () => {
    console.log('Play trailer for:', content.title);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={() => navigate(-1)} variant="outline" size="sm" className="bg-primary/5 backdrop-blur-sm border border-primary/30 text-primary hover:bg-gradient-to-br hover:from-black/30 hover:via-dark-green/5 hover:to-black/30 hover:border-primary/20 transition-all duration-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <Card className="bg-gradient-to-br from-black/90 via-dark-green/20 to-black/90 backdrop-blur-sm border border-border/50 wave-transition relative overflow-hidden">
            {/* Animated Background Waves */}
            <div className="absolute inset-0">
              <div className="upcoming-wave-bg-1"></div>
              <div className="upcoming-wave-bg-2"></div>
              <div className="upcoming-wave-bg-3"></div>
            </div>

            <CardHeader className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="w-full aspect-[16/9] relative overflow-hidden rounded-lg">
                    <img 
                      src={content.thumbnail_url || content.image || '/placeholder.svg'} 
                      alt={content.title} 
                      className="w-full h-full object-cover object-center" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/placeholder.svg') {
                          target.src = '/placeholder.svg';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6 min-w-0">
                  <h1 className="text-xl font-bold text-foreground">
                    {content.title}
                  </h1>

                  <div className="flex items-center space-x-3 flex-wrap">
                    {content.rating_type && (
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded border border-primary/30 text-xs font-medium">
                        {content.rating_type}
                      </span>
                    )}
                    {content.content_type && (
                      <span className="bg-blue-900/25 text-blue-200 px-2 py-1 rounded border border-blue-800/40 text-xs font-medium">
                        {content.content_type}
                      </span>
                    )}
                    {content.release_date && (
                      <div className="flex items-center space-x-2 bg-emerald-800/20 px-2 py-1 rounded-md border border-emerald-700/30">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-100 font-medium text-xs">
                          {new Date(content.release_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {content.description && (
                    <div className="mt-4">
                      <p className="text-foreground/90 leading-relaxed text-sm font-normal whitespace-pre-line break-words">
                        {content.description}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end mt-6">
                    <Button onClick={handleTrailerClick} className="bg-primary/10 backdrop-blur-sm border border-primary/50 text-primary hover:bg-gradient-to-br hover:from-black/60 hover:via-dark-green/10 hover:to-black/60 hover:border-primary/30 transition-all duration-300 px-3 py-1.5 text-xs">
                      <Play className="h-3 w-3 mr-1" />
                      Trailer
                    </Button>
                  </div>

                  {/* Additional Announcement Details */}
                  <div className="space-y-4 border-t border-border/30 pt-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Additional Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content.genre && content.genre.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Genres</h3>
                          <div className="flex flex-wrap gap-2">
                            {content.genre.map((g, index) => (
                              <span key={index} className="bg-purple-800/20 text-purple-300 px-2 py-1 rounded border border-purple-700/30 text-xs">
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {content.directors && content.directors.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Directors</h3>
                        <div className="flex flex-wrap gap-2">
                          {content.directors.map((director, index) => (
                            <span key={index} className="bg-orange-800/20 text-orange-300 px-2 py-1 rounded border border-orange-700/30 text-xs">
                              {director}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {content.writers && content.writers.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Writers</h3>
                        <div className="flex flex-wrap gap-2">
                          {content.writers.map((writer, index) => (
                            <span key={index} className="bg-teal-800/20 text-teal-300 px-2 py-1 rounded border border-teal-700/30 text-xs">
                              {writer}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {content.cast_members && content.cast_members.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Cast Members</h3>
                        <div className="flex flex-wrap gap-2">
                          {content.cast_members.map((cast, index) => (
                            <span key={index} className="bg-pink-800/20 text-pink-300 px-2 py-1 rounded border border-pink-700/30 text-xs">
                              {cast}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UpcomingMoreInfo;
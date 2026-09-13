'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

export default function Home() {
  const [songs, setSongs] = useState<any[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs() {
    const { data, error } = await supabase.from('songs').select('*');
    if (error) console.error('Error fetching songs:', error);
    else if (data && data.length > 0) setSongs(data);
  }

  const currentSong = songs[currentSongIndex];

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current && audioRef.current.duration) {
      const seekTime = (Number(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(Number(e.target.value));
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
        <h1 className="text-xl font-bold mb-4 text-center">My Music Player</h1>
        
        {currentSong ? (
          <div>
            {/* Album Cover */}
            <img 
              src={currentSong.cover_url || 'https://via.placeholder.com/300'} 
              alt={currentSong.title} 
              className="w-full h-64 object-cover rounded-xl mb-4"
            />
            
            {/* Song Info */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{currentSong.title}</h2>
              <p className="text-sm text-gray-400">{currentSong.artist}</p>
            </div>

            {/* Audio Element */}
            <audio
              ref={audioRef}
              src={currentSong.audio_url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full accent-green-500 cursor-pointer mb-6"
            />

            {/* Playback Controls */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <button 
                onClick={() => setCurrentSongIndex((prev) => (prev > 0 ? prev - 1 : songs.length - 1))}
                className="px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700"
              >
                Prev
              </button>
              <button 
                onClick={togglePlay}
                className="px-6 py-3 bg-green-500 rounded-full text-black font-bold hover:bg-green-400"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button 
                onClick={() => setCurrentSongIndex((prev) => (prev < songs.length - 1 ? prev + 1 : 0))}
                className="px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-10">Loading songs from database...</p>
        )}

        {/* Playlist View */}
        <div className="border-t border-gray-800 pt-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-400">Playlist</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {songs.map((song, index) => (
              <div 
                key={song.id}
                onClick={() => { setCurrentSongIndex(index); setIsPlaying(false); }}
                className={`p-2 rounded cursor-pointer flex justify-between items-center text-sm ${
                  index === currentSongIndex ? 'bg-gray-800 text-green-400' : 'hover:bg-gray-800/50'
                }`}
              >
                <span>{song.title}</span>
                <span className="text-xs text-gray-500">{song.artist}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
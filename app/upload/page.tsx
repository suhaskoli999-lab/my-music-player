'use client';

import { useState } from 'react';
import { supabase } from '../../supabase';
import Link from 'next/link';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist || !audioFile) {
      setMessage('Please enter a title, artist, and select an audio file.');
      return;
    }

    setUploading(true);
    setMessage('Uploading track to Supabase...');

    try {
      // 1. Upload audio file
      const audioPath = `audio_${Date.now()}_${audioFile.name}`;
      const { error: audioErr } = await supabase.storage
        .from('music')
        .upload(audioPath, audioFile);

      if (audioErr) throw audioErr;

      const { data: audioData } = supabase.storage
        .from('music')
        .getPublicUrl(audioPath);

      // 2. Upload cover image (or use fallback)
      let coverUrl = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300';
      if (coverFile) {
        const coverPath = `cover_${Date.now()}_${coverFile.name}`;
        const { error: coverErr } = await supabase.storage
          .from('music')
          .upload(coverPath, coverFile);

        if (coverErr) throw coverErr;

        const { data: coverData } = supabase.storage
          .from('music')
          .getPublicUrl(coverPath);
        coverUrl = coverData.publicUrl;
      }

      // 3. Insert metadata record into 'songs' table
      const { error: dbErr } = await supabase.from('songs').insert([
        {
          title,
          artist,
          audio_url: audioData.publicUrl,
          cover_url: coverUrl,
          duration: 180,
        },
      ]);

      if (dbErr) throw dbErr;

      setMessage('Song uploaded successfully!');
      setTitle('');
      setArtist('');
      setAudioFile(null);
      setCoverFile(null);
    } catch (err: any) {
      console.error(err);
      setMessage(`Upload error: ${err.message || 'Failed to upload'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Upload Track</h1>
          <Link href="/" className="text-xs bg-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-700">
            ← Back to Player
          </Link>
        </div>

        {message && (
          <div className="mb-4 text-xs p-3 rounded bg-gray-800 border border-gray-700 text-center text-green-400">
            {message}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-400">Song Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blinding Lights"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-400">Artist Name *</label>
            <input
              type="text"
              required
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. The Weeknd"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-400">Audio File (.mp3) *</label>
            <input
              type="file"
              accept="audio/*"
              required
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-400">Cover Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-colors disabled:opacity-50 mt-4"
          >
            {uploading ? 'Uploading...' : 'Upload Song'}
          </button>
        </form>
      </div>
    </main>
  );
}
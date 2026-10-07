import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Library/Sidebar';
import { Navbar } from './components/Layout/Navbar';
import { LibraryView } from './components/Library/LibraryView';
import { BottomPlayer } from './components/Player/BottomPlayer';
import { AudioVisualizerModal } from './components/Player/AudioVisualizerModal';
import { EqualizerModal } from './components/Player/EqualizerModal';
import { MiniPlayer } from './components/Player/MiniPlayer';
import { ShortcutsModal } from './components/Shortcuts/ShortcutsModal';
import { PlaylistModal } from './components/Playlists/PlaylistModal';
import { LyricsModal } from './components/Player/LyricsModal';
import { SleepTimerModal } from './components/Player/SleepTimerModal';
import { EditTrackModal } from './components/Library/EditTrackModal';
import { CommandPaletteModal } from './components/CommandPalette/CommandPaletteModal';
import { StatsModal } from './components/Library/StatsModal';
import { ShareTrackModal } from './components/Player/ShareTrackModal';
import { ToastContainer } from './components/Common/ToastContainer';
import { useLibraryStore } from './stores/useLibraryStore';
import { usePlayerStore } from './stores/usePlayerStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import {
  extractPaletteFromImageUrl,
  applyDynamicPaletteToDocument,
  getDefaultPalette,
} from './lib/colorExtractor';

export const App: React.FC = () => {
  const { loadFromDatabase } = useLibraryStore();
  const { initAudioListeners, currentTrack } = usePlayerStore();
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);

  // Initialize global keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    initAudioListeners();
    loadFromDatabase();
  }, [initAudioListeners, loadFromDatabase]);

  // Adaptive ambient glow effect based on active track cover artwork
  useEffect(() => {
    if (currentTrack?.coverUrl) {
      extractPaletteFromImageUrl(currentTrack.coverUrl).then((palette) => {
        applyDynamicPaletteToDocument(palette);
      });
    } else {
      applyDynamicPaletteToDocument(getDefaultPalette());
    }
  }, [currentTrack?.coverUrl]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)] font-sans antialiased transition-colors duration-200">
      {/* Left Sidebar */}
      <Sidebar onOpenCreatePlaylistModal={() => setIsCreatePlaylistOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Navbar />
        <LibraryView onOpenCreatePlaylistModal={() => setIsCreatePlaylistOpen(true)} />
        <BottomPlayer />
      </main>

      {/* Modals & Overlays */}
      <AudioVisualizerModal />
      <EqualizerModal />
      <ShortcutsModal />
      <LyricsModal />
      <SleepTimerModal />
      <EditTrackModal />
      <CommandPaletteModal />
      <StatsModal />
      <ShareTrackModal />
      <PlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />
      <MiniPlayer />
      <ToastContainer />
    </div>
  );
};

export default App;

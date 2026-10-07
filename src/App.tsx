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
import { PlayerPreferencesModal } from './components/Player/PlayerPreferencesModal';
import { AppearanceModal } from './components/Layout/AppearanceModal';
import { DashboardPreferencesModal } from './components/Library/DashboardPreferencesModal';
import { DisplayPreferencesModal } from './components/Library/DisplayPreferencesModal';
import { ToastContainer } from './components/Common/ToastContainer';
import { useLibraryStore } from './stores/useLibraryStore';
import { usePlayerStore } from './stores/usePlayerStore';
import { useHomeDashboardStore } from './stores/useHomeDashboardStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import {
  extractPaletteFromImageUrl,
  applyDynamicPaletteToDocument,
  getDefaultPalette,
} from './lib/colorExtractor';

export const App: React.FC = () => {
  const { loadFromDatabase } = useLibraryStore();
  const syncNavigationFromLocation = useLibraryStore((state) => state.syncNavigationFromLocation);
  const navigateTo = useLibraryStore((state) => state.navigateTo);
  const { initAudioListeners, currentTrack } = usePlayerStore();
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);

  // Initialize global keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    initAudioListeners();
    void loadFromDatabase().then(() => {
      const library = useLibraryStore.getState();
      usePlayerStore.getState().restorePlaybackSession(library.tracks, library.playlists);
    });
  }, [initAudioListeners, loadFromDatabase]);

  useEffect(() => {
    const initialLanding = useHomeDashboardStore.getState().landingView;
    const currentHash = window.location.hash;
    const isRootLibraryRoute = !currentHash || /^#\/?(?:home|tracks|favorites)?$/.test(currentHash);
    if (initialLanding !== 'last' && isRootLibraryRoute) {
      navigateTo(initialLanding);
    } else {
      syncNavigationFromLocation();
    }
    const syncNavigation = () => syncNavigationFromLocation();
    window.addEventListener('popstate', syncNavigation);
    window.addEventListener('hashchange', syncNavigation);
    return () => {
      window.removeEventListener('popstate', syncNavigation);
      window.removeEventListener('hashchange', syncNavigation);
    };
  }, [navigateTo, syncNavigationFromLocation]);

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
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)] font-sans antialiased relative selection:bg-[#7C5CFF]/30">
      {/* Ambient Liquid Plasma Mesh Layer */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none" style={{ opacity: 'var(--ambient-glow-opacity, 1)' }}>
        {/* Blob 1: Vibrant Purple / Violet Sphere */}
        <div className="absolute -top-32 -left-32 w-96 md:w-[36rem] h-96 md:h-[36rem] rounded-full bg-gradient-to-br from-[#7C5CFF]/25 via-[#6366F1]/15 to-transparent blur-[80px] animate-liquid-mesh-1" />
        
        {/* Blob 2: Cyan / Aqua Sphere */}
        <div className="absolute top-1/4 -right-32 w-80 md:w-[32rem] h-80 md:h-[32rem] rounded-full bg-gradient-to-bl from-[#4FD1C5]/25 via-[#06B6D4]/15 to-transparent blur-[85px] animate-liquid-mesh-2" />
        
        {/* Blob 3: Rose / Magenta Flare */}
        <div className="absolute -bottom-28 left-1/3 w-80 md:w-[34rem] h-80 md:h-[34rem] rounded-full bg-gradient-to-tr from-[#EC4899]/18 via-[#8B5CF6]/12 to-transparent blur-[90px] animate-liquid-mesh-3" />
        
        {/* Blob 4: Dynamic Glow responsive to Track Artwork */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[38rem] rounded-full blur-[110px] opacity-40 transition-all duration-1000 animate-liquid-mesh-4"
          style={{ backgroundColor: 'var(--dynamic-glow-1, rgba(124, 92, 255, 0.2))' }}
        />
      </div>

      {/* Left Sidebar (Desktop fixed, Mobile slide-over) */}
      <Sidebar onOpenCreatePlaylistModal={() => setIsCreatePlaylistOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
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
      <PlayerPreferencesModal />
      <AppearanceModal />
      <DashboardPreferencesModal />
      <DisplayPreferencesModal />
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

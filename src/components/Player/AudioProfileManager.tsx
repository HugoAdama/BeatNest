import React, { useMemo, useState } from 'react';
import { AudioLines, Check, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { useAudioSettingsStore } from '../../stores/useAudioSettingsStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { showToast } from '../../stores/useToastStore';
import type { AudioProfileTargetType } from '../../types/music';

export const AudioProfileManager: React.FC = () => {
  const {
    audioProfiles,
    audioProfileBindings,
    activeAudioProfileId,
    saveAudioProfile,
    deleteAudioProfile,
    bindAudioProfile,
    applyAudioProfile,
  } = useAudioSettingsStore();
  const { tracks, playlists } = useLibraryStore();
  const [profileName, setProfileName] = useState('');
  const [targetType, setTargetType] = useState<AudioProfileTargetType>('genre');
  const [targetId, setTargetId] = useState('');
  const [profileId, setProfileId] = useState('');

  const genres = useMemo(() => {
    const unique = new Map<string, string>();
    tracks.forEach((track) => {
      const genre = track.genre?.trim();
      if (genre && genre.toLocaleLowerCase() !== 'unknown') {
        const key = genre.toLocaleLowerCase();
        if (!unique.has(key)) unique.set(key, genre);
      }
    });
    return [...unique.values()].sort((a, b) => a.localeCompare(b));
  }, [tracks]);

  const targetOptions = targetType === 'genre'
    ? genres.map((genre) => ({ id: genre, name: genre }))
    : playlists.map((playlist) => ({ id: playlist.id, name: playlist.name }));

  const handleSaveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    const newProfileId = saveAudioProfile(profileName);
    if (!newProfileId) return;
    setProfileName('');
    setProfileId(newProfileId);
    showToast('Perfil guardado', 'Se guardó la configuración actual de ecualización y audio.', 'success');
  };

  const handleBindProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (!targetId || !profileId) return;
    bindAudioProfile(targetType, targetId, profileId);
    const targetName = targetOptions.find((option) => option.id === targetId)?.name ?? targetId;
    showToast('Perfil automático configurado', `Se aplicará a «${targetName}» al reproducir sus pistas.`, 'success');
  };

  const getTargetName = (bindingTargetType: AudioProfileTargetType, bindingTargetId: string) => {
    if (bindingTargetType === 'playlist') {
      return playlists.find((playlist) => playlist.id === bindingTargetId)?.name ?? 'Playlist ya no disponible';
    }
    return genres.find((genre) => genre.toLocaleLowerCase() === bindingTargetId) ?? bindingTargetId;
  };

  return (
    <section className="mt-4 space-y-3 rounded-2xl border border-[var(--liquid-glass-border-subtle)] bg-[var(--app-surface)]/55 p-3 sm:p-4">
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#4FD1C5]/15 text-[#4FD1C5]">
          <AudioLines size={16} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-[var(--app-text)]">Perfiles automáticos</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--app-text-muted)]">
            Guarda una combinación de ecualizador, reverberación y nivelación; asígnala a un género o playlist.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={profileName}
          onChange={(event) => setProfileName(event.target.value)}
          maxLength={32}
          placeholder="Nombre del perfil, por ejemplo: Nocturno"
          aria-label="Nombre del nuevo perfil de audio"
          className="min-w-0 flex-1 rounded-xl border border-[var(--liquid-glass-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/50"
        />
        <button
          type="submit"
          disabled={!profileName.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--app-accent)] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={14} /> Guardar actual
        </button>
      </form>

      {audioProfiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[var(--app-text-muted)]">Perfiles guardados</p>
          <div className="space-y-1.5">
            {audioProfiles.map((profile) => (
              <div key={profile.id} className="flex items-center gap-2 rounded-xl border border-[var(--liquid-glass-border-subtle)] px-2.5 py-2">
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--app-text)]">
                  {profile.name}
                  {activeAudioProfileId === profile.id && <span className="ml-2 text-[10px] text-[#4FD1C5]">Activo</span>}
                </span>
                <button
                  type="button"
                  onClick={() => applyAudioProfile(profile.id)}
                  className="rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--app-accent)] hover:bg-[var(--app-surface-hover)]"
                >
                  Aplicar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteAudioProfile(profile.id);
                    if (profileId === profile.id) setProfileId('');
                  }}
                  aria-label={`Eliminar perfil ${profile.name}`}
                  title="Eliminar perfil y sus asignaciones"
                  className="rounded-lg p-1.5 text-[var(--app-text-muted)] hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleBindProfile} className="grid grid-cols-1 gap-2 border-t border-[var(--liquid-glass-border-subtle)] pt-3 sm:grid-cols-[0.8fr_1.2fr_1fr_auto] sm:items-end">
        <label className="text-[11px] font-medium text-[var(--app-text-muted)]">
          Aplicar por
          <select
            value={targetType}
            onChange={(event) => {
              setTargetType(event.target.value as AudioProfileTargetType);
              setTargetId('');
            }}
            className="mt-1 block w-full rounded-lg border border-[var(--liquid-glass-border)] bg-[var(--app-surface)] px-2 py-2 text-xs text-[var(--app-text)]"
          >
            <option value="genre">Género</option>
            <option value="playlist">Playlist</option>
          </select>
        </label>
        <label className="text-[11px] font-medium text-[var(--app-text-muted)]">
          {targetType === 'genre' ? 'Género' : 'Playlist'}
          <select
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-[var(--liquid-glass-border)] bg-[var(--app-surface)] px-2 py-2 text-xs text-[var(--app-text)]"
          >
            <option value="">Selecciona…</option>
            {targetOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
        </label>
        <label className="text-[11px] font-medium text-[var(--app-text-muted)]">
          Perfil
          <select
            value={profileId}
            onChange={(event) => setProfileId(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-[var(--liquid-glass-border)] bg-[var(--app-surface)] px-2 py-2 text-xs text-[var(--app-text)]"
          >
            <option value="">Selecciona…</option>
            {audioProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
          </select>
        </label>
        <button
          type="submit"
          disabled={!targetId || !profileId}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--liquid-glass-border)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check size={13} /> Vincular
        </button>
      </form>

      {targetOptions.length === 0 && (
        <p className="rounded-xl border border-dashed border-[var(--liquid-glass-border)] px-3 py-2 text-xs text-[var(--app-text-muted)]">
          {targetType === 'genre' ? 'Importa pistas con género para crear una asignación por género.' : 'Crea una playlist para poder asignarle un perfil.'}
        </p>
      )}

      {audioProfileBindings.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[var(--app-text-muted)]">Asignaciones automáticas</p>
          {audioProfileBindings.map((binding) => {
            const profile = audioProfiles.find((item) => item.id === binding.profileId);
            return (
              <div key={`${binding.targetType}:${binding.targetId}`} className="flex items-center gap-2 rounded-xl bg-[var(--app-surface)]/70 px-2.5 py-2 text-xs">
                <Sparkles size={13} className="shrink-0 text-[#4FD1C5]" />
                <span className="min-w-0 flex-1 truncate text-[var(--app-text)]">
                  {getTargetName(binding.targetType, binding.targetId)}
                  <span className="text-[var(--app-text-muted)]"> · {profile?.name ?? 'Perfil no disponible'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => bindAudioProfile(binding.targetType, binding.targetId, null)}
                  aria-label={`Quitar perfil de ${getTargetName(binding.targetType, binding.targetId)}`}
                  title="Quitar asignación"
                  className="rounded-md p-1 text-[var(--app-text-muted)] hover:bg-red-500/10 hover:text-red-500"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

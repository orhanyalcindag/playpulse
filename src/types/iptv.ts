export interface XtreamCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface XtreamUserInfo {
  username: string;
  password?: string;
  message?: string;
  auth: number;
  status: string;
  exp_date?: string;
  is_trial?: string;
  active_cons?: string;
  created_at?: string;
  max_connections?: string;
  allowed_output_formats?: string[];
}

export interface XtreamServerInfo {
  url?: string;
  port?: string;
  https_port?: string;
  server_protocol?: string;
  rtmp_port?: string;
  timezone?: string;
  time_now?: string;
  version?: string;
}

export interface XtreamAuthResponse {
  user_info: XtreamUserInfo;
  server_info: XtreamServerInfo;
}

export interface LiveCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface LiveStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export interface VodCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface VodStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  rating: string | number;
  rating_5based: number;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
}

export interface VodInfo {
  info: {
    name?: string;
    movie_image?: string;
    tmdb_id?: string;
    releasedate?: string;
    plot?: string;
    duration?: string;
    duration_secs?: number;
    genre?: string;
    rating?: string | number;
    director?: string;
    cast?: string;
    backdrop_path?: string[];
    youtube_trailer?: string;
  };
  movie_data: {
    stream_id: number;
    name: string;
    container_extension: string;
  };
}

export interface SeriesCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface SeriesItem {
  num: number;
  name: string;
  series_id: number;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  last_modified: string;
  rating: string | number;
  rating_5based: number;
  backdrop_path: string[];
  youtube_trailer: string;
  episode_run_time: string;
  category_id: string;
}

export interface EpisodeItem {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    duration_secs?: number;
    duration?: string;
    plot?: string;
    releasedate?: string;
    rating?: string | number;
    movie_image?: string;
  };
  season: number;
}

export interface SeriesInfoResponse {
  seasons: Array<{
    air_date?: string;
    episode_count?: number;
    id?: number;
    name?: string;
    overview?: string;
    season_number: number;
    cover?: string;
  }>;
  info: {
    name?: string;
    cover?: string;
    plot?: string;
    cast?: string;
    director?: string;
    genre?: string;
    releaseDate?: string;
    rating?: string | number;
    backdrop_path?: string[];
    episode_run_time?: string;
  };
  episodes: {
    [seasonNum: string]: EpisodeItem[];
  };
}

export interface WatchProgressItem {
  id: string; // can be "vod-{id}" or "series-{seriesId}-s{season}-e{ep}"
  contentId: string | number;
  type: 'movie' | 'series' | 'live';
  title: string;
  subtitle?: string;
  poster: string;
  streamUrl: string;
  currentTime: number;
  duration: number;
  progressPercentage: number;
  lastWatchedAt: number;
  seriesId?: number;
  seasonNum?: number;
  episodeNum?: number;
  episodeId?: string;
}

export interface FavoriteItem {
  id: string;
  type: 'live' | 'movie' | 'series';
  name: string;
  streamId: number;
  icon: string;
  categoryName?: string;
  rating?: string | number;
  addedAt: number;
  container_extension?: string;
}

export type ActiveTab = 'home' | 'live' | 'movies' | 'series' | 'favorites';

export interface PlayingMedia {
  id: string;
  title: string;
  subtitle?: string;
  poster?: string;
  streamUrl: string;
  type: 'live' | 'movie' | 'series';
  contentId: string | number;
  seriesId?: number;
  seasonNum?: number;
  episodeNum?: number;
  episodeId?: string;
  nextEpisode?: {
    title: string;
    seasonNum: number;
    episodeNum: number;
    streamUrl: string;
    episodeId: string;
    poster?: string;
  };
}

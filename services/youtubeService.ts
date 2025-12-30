export const searchYouTubeVideo = async (query: string): Promise<string | null> => {
  try {
    const apiKey = "AIzaSyA7moypCEBCH9Ui6yBu78DdNOZWYXsvtfI";
    if (!apiKey) {
      console.warn("Missing YOUTUBE_API_KEY");
      return null;
    }

    const url =
      "https://www.googleapis.com/youtube/v3/search?" +
      new URLSearchParams({
        part: "snippet",
        q: query,
        maxResults: "5",               // Fetch 5 to have a better chance of finding a valid video
        type: "video",                 // only real videos
        videoEmbeddable: "true",       // must be embeddable
        videoSyndicated: "true",       // can play outside YouTube
        order: "relevance",
        safeSearch: "none",
        fields: "items(id(videoId), snippet(title))",
        key: apiKey
      }).toString();

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(
        `YouTube Search Error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();
    const items = data.items || [];

    if (items.length === 0) {
      return null;
    }

    // Pick the first valid video ID (skip Shorts or invalid IDs)
    const valid = items.find(
      (item: any) => item?.id?.videoId && item.id.videoId.length === 11
    );

    if (!valid) {
      console.warn("No valid playable YouTube video found");
      return null;
    }

    return valid.id.videoId;

  } catch (error) {
    console.error("YouTube Search API failed:", error);
    return null;
  }
};

import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [storyId, setStoryId] = useState(1);
  const [assets, setAssets] = useState([]);
  const [trendingStories, setTrendingStories] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/get-trending")
      .then((response) => setTrendingStories(response.data.trendingStories))
      .catch((error) => console.log(error));
  }, []);

  const handleStoreMetadata = async () => {
    await axios.post(`http://localhost:5000/store-metadata/${storyId}`);
  };

  const handleCacheAssets = async () => {
    await axios.post(`http://localhost:5000/cache-assets/${storyId}`);
  };

  const handleUpdateTrending = async () => {
    await axios.post(`http://localhost:5000/update-trending/${storyId}`);
    axios
      .get("http://localhost:5000/get-trending")
      .then((response) => setTrendingStories(response.data.trendingStories))
      .catch((error) =>
        console.error("Error updating trending stories:", error)
      );
  };

  const fetchAssets = async () => {
    const response = await axios.get(
      `http://localhost:5000/get-assets/${storyId}`
    );
    setAssets(response.data.assets);
  };
  return (
    <div>
      <h1>Story {storyId}</h1>
      <input
        type="number"
        min="1"
        max="100"
        value={storyId}
        onChange={(e) => setStoryId(e.target.value)}
      />
      <button onClick={handleStoreMetadata}>Store Metadata</button>
      <button onClick={handleCacheAssets}>Cache Assets</button>
      <button onClick={handleUpdateTrending}>Update Trending</button>
      <button onClick={fetchAssets}>Fetch Assets</button>

      <h2>Cached Assets</h2>
      <ul>
        {assets.map((asset, index) => (
          <li key={index}>{asset}</li>
        ))}
      </ul>

      <h2>Trending Stories</h2>
      <ul>
        {trendingStories.map((story, index) => (
          <li key={index}>Story {story}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

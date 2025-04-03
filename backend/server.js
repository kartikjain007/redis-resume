const express = require("express");
const app = express();
const { createClient } = require("redis");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const axios = require("axios");

const redisClient = createClient();

redisClient.on("error", (error) => console.log(error));

(async () => {
  redisClient.connect();
})();

const storeStoryMetadata = async (storyId) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/posts/${storyId}`
  );

  const metadata = {
    title: data.title,
    author: `User ${data.userId}`,
    category: "General",
  };

  await redisClient.hSet(`story:${storyId}:metadata`, metadata);
};

const cacheStoryAssets = async (storyId) => {
  const key = `story:${storyId}:assets`;
  await redisClient.del(key);
  const assets = [`https://picsum.photos/200/300?random=${storyId}`];

  await redisClient.rPush(key, ...assets);
};

const getCachedStoryAssets = async (storyId) => {
  return await redisClient.lRange(`story:${storyId}:assets`, 0, -1);
};

const updateTrendingStories = async (storyId) => {
  const engagementScore = Math.floor(Math.random() * 5000) + 100;
  await redisClient.zAdd("trending stories", {
    score: engagementScore,
    value: storyId,
  });
};

const getTrendingStories = async () => {
  return await redisClient.zRange("trending stories", -10, -1, { REV: true });
};

app.post("/store-metadata/:storyId", async (req, res) => {
  await storeStoryMetadata(req.params.storyId);
  res.json({ message: `Metadata for story ${req.params.storyId} stored.` });
});

app.post("/cache-assets", async (req, res) => {
  await cacheStoryAssets(req.params.storyId);
  res.json({ message: `Assets for story ${req.params.storyId} cached.` });
});

app.post("/update-trending/:storyId", async (req, res) => {
  await updateTrendingStories(req.params.storyId);
  res.json({ message: `Story ${req.params.storyId} added to trending.` });
});

app.get("/get-trending", async (req, res) => {
  const trendingStories = await getTrendingStories();
  res.json({ trendingStories });
});

app.get("/get-assets/:storyId", async (req, res) => {
  const assets = await getCachedStoryAssets(req.params.storyId);
  res.json({ assets });
});

app.listen(5000, () => console.log(`Server is running on 5000`));

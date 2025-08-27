self.addEventListener("install", event => {
  console.log("K-XpertAI installed 🚀");
});

self.addEventListener("fetch", event => {
  event.respondWith(fetch(event.request));
});
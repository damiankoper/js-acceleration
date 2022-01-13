import handler from "serve-handler";
import http from "http";
import portastic from "portastic";

const server = http.createServer((request, response) => {
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  return handler(request, response, {
    public: "./dist",
  });
});

(async () => {
  const port = await portastic.find({
    min: 8080,
    max: 8090,
    retrieve: 1,
  });
  server.listen(port[0], () => {
    console.log("Running at http://localhost:" + port);
  });
})();

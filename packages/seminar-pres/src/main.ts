import Reveal from "reveal.js";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/simple.css";
import "./style.css";
import Markdown from "reveal.js/plugin/markdown/markdown.esm.js";
import Notes from "reveal.js/plugin/notes/notes.esm.js";
import Highlight from "reveal.js/plugin/highlight/highlight.esm.js";
import Math_ from "reveal.js/plugin/math/math.esm.js";

window.onload = () => {
  const deck = new Reveal({
    plugins: [Markdown, Notes, Highlight, Math_],
  });
  deck.initialize({
    transition: "none",
    slideNumber: true,
    width: 1280,
    height: 720,
    center: false,
    history: true,
  });
};

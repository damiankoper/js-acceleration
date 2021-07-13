# Autorska implementacja algorytmów transformacji Hougha dla wybranych metod akceleracji obliczeń w środowiskach języka JavaScript.

Hough - czyt. [haf]
![image](https://user-images.githubusercontent.com/28621467/125512384-e99a4a4c-be7c-4c28-9cd8-6d10d82bdf83.png)

## Warianty transformacji Hough'a
* SHT - standard
* GHT - generalized
* Jedna z tych (w zależności od czasu):
  * RHT - randomized
  * PHT - probabilistic 

## Środowiska
* Przeglądarka internetowa, różne silniki
  * V8
  * SpiderMonkey
  * Chakra
  * JavaScriptCore
  * Mobile/Desktop
* Node
* Deno

## Metody
* WASM
  * Ominięcie narzutu JS
  * Wsparcie dla SIMD na CPU (od Chrome 91)
* Moduły Cpp
  * https://nodejs.org/api/addons.html
* Wielowątkowość
  * Node
    * Fork
    * worker_threads
  * Deno
    * Web Worker API
  * Przeglądarka
    * Web Worker API
* GPU
  * vanilla WebGL
  * gpu.js
* Hybrydy w zależności od wyników i algorytmów (w zależności od czasu)

## Z czym nie miałem styczności (albo małą)
* WASM + SIMD
* Deno
* Moduły Cpp w Node